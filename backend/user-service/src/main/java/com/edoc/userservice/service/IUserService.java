package com.edoc.userservice.service;

import com.edoc.userservice.dto.PatchUserRequest;
import com.edoc.userservice.dto.UpdateUserRequest;
import com.edoc.userservice.dto.UserResponse;

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
}
