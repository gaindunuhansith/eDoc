package com.edoc.doctorservice.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.util.List;

@Data                          // Lombok: auto generates getters, setters, toString
@NoArgsConstructor             // Lombok: auto generates empty constructor
@AllArgsConstructor            // Lombok: auto generates constructor with all fields
@Document(collection = "doctors")  // This tells MongoDB which collection to use
public class Doctor {

    @Id
    private String id;

    @Indexed(unique = true)    // Email must be unique
    private String email;

    private String password;   // Will be stored as a hashed value, never plain text

    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String specialty;          // e.g. "Cardiologist", "Neurologist"
    private String qualification;      // e.g. "MBBS, MD"
    private String licenseNumber;      // Medical license number
    private int experienceYears;
    private String hospital;
    private String bio;
    private String profileImageUrl;
    private double consultationFee;

    private boolean isVerified;        // Admin must verify the doctor first
    private boolean isAvailable;       // Is the doctor currently active on platform

    private String role = "DOCTOR";    // Always "DOCTOR" for this service

    private List<String> languages;    // Languages the doctor speaks
}
