package com.edoc.patientservice.dto.patient;

import jakarta.validation.constraints.Size;
import java.time.LocalDate;

// Payload for patient registration and profile updates.
public class PatientRequestDTO {

    private LocalDate dateOfBirth;

    @Size(max = 500)
    private String address;

    @Size(max = 20)
    private String gender;

    @Size(max = 10)
    private String bloodGroup;

    @Size(max = 20)
    private String nicNumber;

    @Size(max = 4000)
    private String allergies;

    @Size(max = 50)
    private String emergencyContactPhone;

    private Double height;

    private Double weight;

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getBloodGroup() {
        return bloodGroup;
    }

    public void setBloodGroup(String bloodGroup) {
        this.bloodGroup = bloodGroup;
    }

    public String getNicNumber() {
        return nicNumber;
    }

    public void setNicNumber(String nicNumber) {
        this.nicNumber = nicNumber;
    }

    public String getAllergies() {
        return allergies;
    }

    public void setAllergies(String allergies) {
        this.allergies = allergies;
    }

    public String getEmergencyContactPhone() {
        return emergencyContactPhone;
    }

    public void setEmergencyContactPhone(String emergencyContactPhone) {
        this.emergencyContactPhone = emergencyContactPhone;
    }

    public Double getHeight() {
        return height;
    }

    public void setHeight(Double height) {
        this.height = height;
    }

    public Double getWeight() {
        return weight;
    }

    public void setWeight(Double weight) {
        this.weight = weight;
    }
}
