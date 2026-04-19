package com.edoc.userservice.service.impl;

import com.edoc.userservice.client.DoctorServiceClient;
import com.edoc.userservice.client.PatientServiceClient;
import com.edoc.userservice.payload.request.PatchUserRequest;
import com.edoc.userservice.payload.request.UpdateUserRequest;
import com.edoc.userservice.payload.response.UserResponse;
import com.edoc.userservice.exception.EmailAlreadyExistsException;
import com.edoc.userservice.exception.UnauthorizedOperationException;
import com.edoc.userservice.exception.UserNotFoundException;
import com.edoc.userservice.mapper.UserMapper;
import com.edoc.userservice.model.User;
import com.edoc.userservice.model.enums.UserRole;
import com.edoc.userservice.repository.UserRepository;
import com.edoc.userservice.service.IUserService;
import com.edoc.userservice.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements IUserService {

    private static final Logger log = LoggerFactory.getLogger(UserServiceImpl.class);
    private static final String AUTHENTICATED_USER_NOT_FOUND = "Authenticated user not found";

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final SecurityUtils securityUtils;
    private final PasswordEncoder passwordEncoder;
    private final PatientServiceClient patientServiceClient;
    private final DoctorServiceClient doctorServiceClient;

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser() {
        User user = userRepository.findByEmailAndIsDeletedFalse(securityUtils.getCurrentEmail())
                .orElseThrow(() -> new UserNotFoundException(AUTHENTICATED_USER_NOT_FOUND));
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getByUserId(String userId) {
        User current = userRepository.findByEmailAndIsDeletedFalse(securityUtils.getCurrentEmail())
                .orElseThrow(() -> new UserNotFoundException(AUTHENTICATED_USER_NOT_FOUND));

        User target = securityUtils.isAdmin()
            ? findByUserIdIncludingDeleted(userId)
            : findByUserIdActive(userId);

        enforceOwnerOrAdmin(current, target.getUserId());
        return userMapper.toResponse(target);
    }

    @Override
    @Transactional
    public UserResponse updateByUserId(String userId, UpdateUserRequest request) {
        User target = findByUserIdActive(userId);
        User current = userRepository.findByEmailAndIsDeletedFalse(securityUtils.getCurrentEmail())
                .orElseThrow(() -> new UserNotFoundException(AUTHENTICATED_USER_NOT_FOUND));

        enforceOwnerOrAdmin(current, target.getUserId());

        String normalizedEmail = normalizeEmail(request.getEmail());
        validateUniqueEmail(target, normalizedEmail);

        target.setName(request.getName().trim());
        target.setEmail(normalizedEmail);
        target.setPhoneNumber(request.getPhoneNumber().trim());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            target.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        User updated = userRepository.save(target);
        log.info("Updated user userId={} by requester={}", target.getUserId(), current.getUserId());
        return userMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public UserResponse patchCurrentUser(PatchUserRequest request) {
        User current = userRepository.findByEmailAndIsDeletedFalse(securityUtils.getCurrentEmail())
                .orElseThrow(() -> new UserNotFoundException(AUTHENTICATED_USER_NOT_FOUND));

        applyPatch(current, request, false);
        User updated = userRepository.save(current);
        log.info("Patched current user userId={}", current.getUserId());
        return userMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public UserResponse patchByUserIdAsAdmin(String userId, PatchUserRequest request) {
        User target = findByUserIdActive(userId);

        applyPatch(target, request, true);
        User updated = userRepository.save(target);
        log.info("Admin patched user userId={}", target.getUserId());
        return userMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void markProfileCreated(String userId) {
        User target = findByUserIdActive(userId);
        User current = userRepository.findByEmailAndIsDeletedFalse(securityUtils.getCurrentEmail())
                .orElseThrow(() -> new UserNotFoundException(AUTHENTICATED_USER_NOT_FOUND));

        enforceOwnerOrAdmin(current, target.getUserId());

        target.setProfileCreated(true);
        userRepository.save(target);
        log.info("Marked profile created userId={}", target.getUserId());
    }

    @Override
    @Transactional
    public void deleteCurrentUser() {
        User current = userRepository.findByEmailAndIsDeletedFalse(securityUtils.getCurrentEmail())
                .orElseThrow(() -> new UserNotFoundException(AUTHENTICATED_USER_NOT_FOUND));
        deleteUserAndRelatedData(current);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void deleteByUserId(String userId) {
        User target = findByUserIdIncludingDeleted(userId);
        deleteUserAndRelatedData(target);
    }

    @Override
    @Transactional
    public UserResponse activateUser(String userId) {
        User target = findByUserIdIncludingDeleted(userId);
        if (target.isDeleted()) {
            throw new IllegalArgumentException("Cannot activate a deleted user. Restore first.");
        }
        target.setActive(true);
        User updated = userRepository.save(target);
        log.info("Activated user userId={}", target.getUserId());
        return userMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public UserResponse deactivateUser(String userId) {
        User target = findByUserIdIncludingDeleted(userId);
        if (target.isDeleted()) {
            throw new IllegalArgumentException("Cannot deactivate a deleted user. Restore first.");
        }
        target.setActive(false);
        User updated = userRepository.save(target);
        log.info("Deactivated user userId={}", target.getUserId());
        return userMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public UserResponse restoreUser(String userId) {
        User target = findByUserIdIncludingDeleted(userId);
        if (!target.isDeleted()) {
            return userMapper.toResponse(target);
        }
        target.setDeleted(false);
        target.setDeletedAt(null);
        target.setActive(true);
        User updated = userRepository.save(target);
        log.info("Restored user userId={}", target.getUserId());
        return userMapper.toResponse(updated);
    }

    private User findByUserIdIncludingDeleted(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("userId is required");
        }

        return userRepository.findByUserId(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found for userId: " + userId));
    }

    private User findByUserIdActive(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("userId is required");
        }

        return userRepository.findByUserIdAndIsDeletedFalse(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found for userId: " + userId));
    }

    private void enforceOwnerOrAdmin(User currentUser, String targetUserId) {
        boolean isOwner = currentUser.getUserId().equals(targetUserId);
        if (!isOwner && !securityUtils.isAdmin()) {
            throw new UnauthorizedOperationException("You are not allowed to access this resource");
        }
    }

    private void applyPatch(User target, PatchUserRequest request, boolean allowRoleChange) {
        if (request == null) {
            throw new IllegalArgumentException("Patch payload is required");
        }

        if (target.isDeleted()) {
            throw new IllegalArgumentException("Cannot update a deleted user");
        }

        boolean hasAnyField = false;

        if (request.getName() != null) {
            String trimmedName = request.getName().trim();
            if (trimmedName.isBlank()) {
                throw new IllegalArgumentException("name cannot be blank");
            }
            target.setName(trimmedName);
            hasAnyField = true;
        }

        if (request.getEmail() != null) {
            String normalizedEmail = normalizeEmail(request.getEmail());
            validateUniqueEmail(target, normalizedEmail);
            target.setEmail(normalizedEmail);
            hasAnyField = true;
        }

        if (request.getPhoneNumber() != null) {
            String trimmedPhone = request.getPhoneNumber().trim();
            if (trimmedPhone.isBlank()) {
                throw new IllegalArgumentException("phone number cannot be blank");
            }
            target.setPhoneNumber(trimmedPhone);
            hasAnyField = true;
        }

        if (request.getPassword() != null) {
            if (request.getPassword().isBlank()) {
                throw new IllegalArgumentException("password cannot be blank");
            }
            target.setPassword(passwordEncoder.encode(request.getPassword()));
            hasAnyField = true;
        }

        if (request.getRole() != null) {
            if (!allowRoleChange) {
                throw new UnauthorizedOperationException("Only admin can change role");
            }
            target.setRole(request.getRole());
            hasAnyField = true;
        }

        if (!hasAnyField) {
            throw new IllegalArgumentException("At least one field must be provided for patch");
        }
    }

    private void validateUniqueEmail(User target, String normalizedEmail) {
        boolean emailChanged = !target.getEmail().equalsIgnoreCase(normalizedEmail);
        if (emailChanged && userRepository.existsByEmailAndIsDeletedFalse(normalizedEmail)) {
            throw new EmailAlreadyExistsException("A user already exists with the given email");
        }
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("email is required");
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private void deleteUserAndRelatedData(User user) {
        if (user.isDeleted()) {
            log.info("User already deleted userId={}", user.getUserId());
            return;
        }
        callDownstreamCleanup(user);
        user.setDeleted(true);
        user.setDeletedAt(LocalDateTime.now());
        user.setActive(false);
        userRepository.save(user);
        log.info("Soft deleted user userId={}", user.getUserId());
    }

    @Override
    @Transactional(readOnly = true)
    public User findByEmailForAuthentication(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("email is required");
        }
        
        User user = userRepository.findByEmailAndIsDeletedFalse(normalizeEmail(email))
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));
        
        if (!user.isActive()) {
            throw new UserNotFoundException("User is inactive");
        }
        
        return user;
    }

    private void callDownstreamCleanup(User user) {
        if (user.getRole() == UserRole.PATIENT) {
            safeDownstreamDelete("patient-service", user.getUserId(), () -> patientServiceClient.deleteByUserId(user.getUserId()));
            return;
        }

        if (user.getRole() == UserRole.DOCTOR) {
            safeDownstreamDelete("doctor-service", user.getUserId(), () -> doctorServiceClient.deleteByUserId(user.getUserId()));
        }
    }

    private void safeDownstreamDelete(String serviceName, String userId, Runnable deleteAction) {
        try {
            deleteAction.run();
        } catch (Exception ex) {
            log.warn("Downstream cleanup failed for {} userId={}. Proceeding with local delete.", serviceName, userId, ex);
        }
    }
}
