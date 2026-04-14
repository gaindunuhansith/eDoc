package com.edoc.userservice.service;

import com.edoc.userservice.dto.UpdateUserRequest;
import com.edoc.userservice.dto.UserResponse;

import java.util.List;

public interface IUserService {

    UserResponse getCurrentUser();

    UserResponse getByUserId(String userId);

    UserResponse updateByUserId(String userId, UpdateUserRequest request);

    void deleteCurrentUser();

    List<UserResponse> getAllUsers();

    void deleteByUserId(String userId);
}
