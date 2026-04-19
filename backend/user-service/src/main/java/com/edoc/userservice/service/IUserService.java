package com.edoc.userservice.service;

import com.edoc.userservice.model.User;
import com.edoc.userservice.payload.request.PatchUserRequest;
import com.edoc.userservice.payload.request.UpdateUserRequest;
import com.edoc.userservice.payload.response.UserResponse;

import java.util.List;

public interface IUserService {

    UserResponse getCurrentUser();

    UserResponse getByUserId(String userId);

    UserResponse updateByUserId(String userId, UpdateUserRequest request);

    UserResponse patchCurrentUser(PatchUserRequest request);

    UserResponse patchByUserIdAsAdmin(String userId, PatchUserRequest request);

    void markProfileCreated(String userId);

    void deleteCurrentUser();

    List<UserResponse> getAllUsers();

    void deleteByUserId(String userId);

    UserResponse activateUser(String userId);

    UserResponse deactivateUser(String userId);

    UserResponse restoreUser(String userId);

    /**
     * Fetch user by email for authentication purposes.
     * Used by Spring Security during login.
     * @param email the user's email
     * @return the User entity
     * @throws org.springframework.security.core.userdetails.UsernameNotFoundException if user not found or inactive
     */
    User findByEmailForAuthentication(String email);
}
