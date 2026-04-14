package com.edoc.userservice.service.impl;

import com.edoc.userservice.client.DoctorServiceClient;
import com.edoc.userservice.client.PatientServiceClient;
import com.edoc.userservice.dto.PatchUserRequest;
import com.edoc.userservice.dto.UpdateUserRequest;
import com.edoc.userservice.dto.UserResponse;
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
        User user = userRepository.findByEmail(securityUtils.getCurrentEmail())
                .orElseThrow(() -> new UserNotFoundException(AUTHENTICATED_USER_NOT_FOUND));
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getByUserId(String userId) {
        User target = findByUserId(userId);
        User current = userRepository.findByEmail(securityUtils.getCurrentEmail())
                .orElseThrow(() -> new UserNotFoundException(AUTHENTICATED_USER_NOT_FOUND));

        enforceOwnerOrAdmin(current, target.getUserId());
        return userMapper.toResponse(target);
    }

    @Override
    @Transactional
    public UserResponse updateByUserId(String userId, UpdateUserRequest request) {
        User target = findByUserId(userId);
        User current = userRepository.findByEmail(securityUtils.getCurrentEmail())
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
        return userMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public UserResponse patchCurrentUser(PatchUserRequest request) {
        User current = userRepository.findByEmail(securityUtils.getCurrentEmail())
                .orElseThrow(() -> new UserNotFoundException(AUTHENTICATED_USER_NOT_FOUND));

        applyPatch(current, request, false);
        User updated = userRepository.save(current);
        return userMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public UserResponse patchByUserIdAsAdmin(String userId, PatchUserRequest request) {
        User target = findByUserId(userId);

        applyPatch(target, request, true);
        User updated = userRepository.save(target);
        return userMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void deleteCurrentUser() {
        User current = userRepository.findByEmail(securityUtils.getCurrentEmail())
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
        User target = findByUserId(userId);
        deleteUserAndRelatedData(target);
    }

    private User findByUserId(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("userId is required");
        }

        return userRepository.findByUserId(userId)
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
        if (emailChanged && userRepository.existsByEmail(normalizedEmail)) {
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
        callDownstreamCleanup(user);
        userRepository.delete(user);
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
