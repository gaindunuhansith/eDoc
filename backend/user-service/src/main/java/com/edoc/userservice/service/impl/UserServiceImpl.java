package com.edoc.userservice.service.impl;

import com.edoc.userservice.dto.UpdateUserRequest;
import com.edoc.userservice.dto.UserResponse;
import com.edoc.userservice.exception.UnauthorizedOperationException;
import com.edoc.userservice.exception.UserNotFoundException;
import com.edoc.userservice.mapper.UserMapper;
import com.edoc.userservice.model.User;
import com.edoc.userservice.repository.UserRepository;
import com.edoc.userservice.service.IUserService;
import com.edoc.userservice.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements IUserService {

    private static final String AUTHENTICATED_USER_NOT_FOUND = "Authenticated user not found";

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final SecurityUtils securityUtils;
    private final PasswordEncoder passwordEncoder;

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

        target.setName(request.getName().trim());
        target.setPhoneNumber(request.getPhoneNumber().trim());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            target.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        User updated = userRepository.save(target);
        return userMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void deleteCurrentUser() {
        User current = userRepository.findByEmail(securityUtils.getCurrentEmail())
                .orElseThrow(() -> new UserNotFoundException(AUTHENTICATED_USER_NOT_FOUND));
        userRepository.delete(current);
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
        userRepository.delete(target);
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
}
