package com.edoc.doctorservice.config;

import com.edoc.doctorservice.model.Availability;
import com.edoc.doctorservice.model.Doctor;
import com.edoc.doctorservice.model.Prescription;
import com.edoc.doctorservice.repository.AvailabilityRepository;
import com.edoc.doctorservice.repository.DoctorRepository;
import com.edoc.doctorservice.repository.PrescriptionRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Seeds the doctor-service MongoDB collections on every startup (drops existing data first).
 *
 * Doctor IDs (DOC-001..DOC-013) map to user-service doctor accounts:
 *   DOC-001 → USR-DOC-03  Chathuri Rathnayake    Cardiology
 *   DOC-002 → USR-DOC-04  Dinesh Jayasuriya      Neurology
 *   DOC-003 → USR-DOC-05  Eranga Munasinghe      Orthopedic Surgery
 *   DOC-004 → USR-DOC-06  Fathima Rizvi          Pediatrics
 *   DOC-005 → USR-DOC-07  Gayan Siriwardena      Dermatology
 *   DOC-006 → USR-DOC-08  Harshani Abeywickrama  Gynecology
 *   DOC-007 → USR-DOC-09  Ishan Peiris           Ophthalmology
 *   DOC-008 → USR-DOC-10  Janaka Dassanayake     General Medicine
 *   DOC-009 → USR-DOC-11  Kumari Samaraweera     Psychiatry
 *   DOC-010 → USR-DOC-12  Lasitha Athukorala     Endocrinology
 *   DOC-011 → USR-DOC-13  Malsha Wijesinghe      Gastroenterology
 *   DOC-012 → USR-DOC-14  Nalaka Hettige         Pulmonology
 *   DOC-013 → USR-DOC-15  Oshadi Sampath         ENT
 *
 * Appointments APT-SEED-1001..1040 reference these doctor IDs.
 * Patient UUIDs used in prescriptions match patient-service seed UUIDs.
 */
@Component
public class DataInitializer implements ApplicationRunner {

    private final DoctorRepository doctorRepository;
    private final AvailabilityRepository availabilityRepository;
    private final PrescriptionRepository prescriptionRepository;

    @Value("${seed.enabled:false}")
    private boolean seedEnabled;

    public DataInitializer(DoctorRepository doctorRepository,
                           AvailabilityRepository availabilityRepository,
                           PrescriptionRepository prescriptionRepository) {
        this.doctorRepository = doctorRepository;
        this.availabilityRepository = availabilityRepository;
        this.prescriptionRepository = prescriptionRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!seedEnabled) return;
        prescriptionRepository.deleteAll();
        availabilityRepository.deleteAll();
        doctorRepository.deleteAll();
        seedDoctors();
        seedAvailabilities();
        seedPrescriptions();
    }

    // ─── Doctors ─────────────────────────────────────────────────────────────

    private void seedDoctors() {
        List<Doctor> doctors = List.of(
            doctor("DOC-001", "USR-DOC-03", "chathuri.rathnayake@edoc.com",
                "Chathuri", "Rathnayake", "0733333303",
                "Cardiology", "MBBS, MD (Cardiology), MRCP",
                "SL-CARD-20140312", 12, "Nawaloka Hospital, Colombo",
                "Dr. Chathuri Rathnayake is a senior cardiologist with 12 years of experience " +
                "specialising in interventional cardiology and heart failure management. " +
                "She has performed over 800 cardiac catheterisation procedures.",
                4500.00, List.of("Sinhala", "English", "Tamil")),

            doctor("DOC-002", "USR-DOC-04", "dinesh.jayasuriya@edoc.com",
                "Dinesh", "Jayasuriya", "0744444404",
                "Neurology", "MBBS, MD (Neurology), FRCP",
                "SL-NEUR-20120608", 14, "Lanka Hospitals, Colombo",
                "Dr. Dinesh Jayasuriya is a consultant neurologist specialising in epilepsy, " +
                "stroke management and movement disorders. He leads the stroke unit at Lanka Hospitals " +
                "and has published extensively in peer-reviewed neurology journals.",
                5000.00, List.of("Sinhala", "English")),

            doctor("DOC-003", "USR-DOC-05", "eranga.munasinghe@edoc.com",
                "Eranga", "Munasinghe", "0755555505",
                "Orthopedic Surgery", "MBBS, MS (Ortho), FRCS",
                "SL-ORTH-20110415", 15, "Asiri Surgical Hospital, Colombo",
                "Dr. Eranga Munasinghe is a consultant orthopaedic surgeon with expertise in " +
                "joint replacement surgery, sports injuries and spinal disorders. He has performed " +
                "over 1200 knee and hip replacement surgeries with excellent outcomes.",
                6000.00, List.of("Sinhala", "English")),

            doctor("DOC-004", "USR-DOC-06", "fathima.rizvi@edoc.com",
                "Fathima", "Rizvi", "0766666606",
                "Pediatrics", "MBBS, DCH, MD (Paediatrics)",
                "SL-PAED-20160920", 9, "Sirimavo Bandaranaike Hospital, Colombo",
                "Dr. Fathima Rizvi is a dedicated paediatrician with a special interest in " +
                "neonatal care and childhood development disorders. She provides compassionate " +
                "care to patients from newborns through adolescence.",
                2800.00, List.of("Tamil", "English", "Sinhala")),

            doctor("DOC-005", "USR-DOC-07", "gayan.siriwardena@edoc.com",
                "Gayan", "Siriwardena", "0777777707",
                "Dermatology", "MBBS, MD (Dermatology), DVL",
                "SL-DERM-20150530", 11, "Ninewells Hospital, Colombo",
                "Dr. Gayan Siriwardena is a consultant dermatologist and venereologist with " +
                "expertise in medical and cosmetic dermatology, including acne, psoriasis, " +
                "eczema and skin cancer screening.",
                3500.00, List.of("Sinhala", "English")),

            doctor("DOC-006", "USR-DOC-08", "harshani.abeywickrama@edoc.com",
                "Harshani", "Abeywickrama", "0788888808",
                "Obstetrics & Gynecology", "MBBS, MD (OBG), FRCOG",
                "SL-GYNEC-20130722", 13, "Durdans Hospital, Colombo",
                "Dr. Harshani Abeywickrama is a consultant obstetrician and gynaecologist " +
                "specialising in high-risk pregnancies, laparoscopic surgery and infertility " +
                "management. She has delivered over 3000 babies throughout her career.",
                4000.00, List.of("Sinhala", "English")),

            doctor("DOC-007", "USR-DOC-09", "ishan.peiris@edoc.com",
                "Ishan", "Peiris", "0711999909",
                "Ophthalmology", "MBBS, DO, MS (Ophthalmology)",
                "SL-OPHT-20170310", 8, "National Eye Hospital, Colombo",
                "Dr. Ishan Peiris is a consultant ophthalmologist with special expertise in " +
                "cataract surgery, diabetic retinopathy management and glaucoma treatment. " +
                "He performs over 600 eye surgeries annually.",
                3200.00, List.of("Sinhala", "English", "Tamil")),

            doctor("DOC-008", "USR-DOC-10", "janaka.dassanayake@edoc.com",
                "Janaka", "Dassanayake", "0722000010",
                "General Medicine", "MBBS, MD (Internal Medicine)",
                "SL-GMED-20100218", 16, "Colombo South Teaching Hospital",
                "Dr. Janaka Dassanayake is a senior consultant physician with vast experience " +
                "in internal medicine, diabetes management, hypertension and metabolic disorders. " +
                "He is the most accessible physician on the platform for general consultations.",
                2000.00, List.of("Sinhala", "English")),

            doctor("DOC-009", "USR-DOC-11", "kumari.samaraweera@edoc.com",
                "Kumari", "Samaraweera", "0733111111",
                "Psychiatry", "MBBS, MRCPsych, MD (Psychiatry)",
                "SL-PSYC-20140507", 12, "National Institute of Mental Health, Mulleriyawa",
                "Dr. Kumari Samaraweera is a consultant psychiatrist specialising in mood " +
                "disorders, anxiety, psychosis and addiction. She offers both in-person and " +
                "telemedicine consultations and is a strong advocate for mental health awareness in Sri Lanka.",
                4000.00, List.of("Sinhala", "English")),

            doctor("DOC-010", "USR-DOC-12", "lasitha.athukorala@edoc.com",
                "Lasitha", "Athukorala", "0744222212",
                "Endocrinology", "MBBS, MD (Endocrinology), MRCP",
                "SL-ENDO-20160115", 10, "Teaching Hospital, Kandy",
                "Dr. Lasitha Athukorala is a consultant endocrinologist managing diabetes, " +
                "thyroid disorders, adrenal conditions and metabolic bone disease. He has " +
                "established a specialised diabetes care clinic serving central Sri Lanka.",
                3800.00, List.of("Sinhala", "English")),

            doctor("DOC-011", "USR-DOC-13", "malsha.wijesinghe@edoc.com",
                "Malsha", "Wijesinghe", "0755333313",
                "Gastroenterology", "MBBS, MD (Gastroenterology), MRCP",
                "SL-GAST-20150825", 11, "Asiri Central Hospital, Colombo",
                "Dr. Malsha Wijesinghe is a consultant gastroenterologist and hepatologist " +
                "with expertise in endoscopy, liver disease, inflammatory bowel disease and " +
                "colorectal conditions. She performs over 500 endoscopic procedures yearly.",
                4200.00, List.of("Sinhala", "English")),

            doctor("DOC-012", "USR-DOC-14", "nalaka.hettige@edoc.com",
                "Nalaka", "Hettige", "0766444414",
                "Pulmonology", "MBBS, MD (Respiratory Medicine), FCCP",
                "SL-PULM-20170628", 9, "Chest Hospital, Welisara",
                "Dr. Nalaka Hettige is a consultant respiratory physician specialising in " +
                "asthma, COPD, sleep apnoea and interstitial lung disease. He is trained in " +
                "bronchoscopy and thoracentesis procedures.",
                3600.00, List.of("Sinhala", "English")),

            doctor("DOC-013", "USR-DOC-15", "oshadi.sampath@edoc.com",
                "Oshadi", "Sampath", "0777555515",
                "ENT", "MBBS, MS (ENT), DLO",
                "SL-ENT-20180412", 7, "Eye Ear Nose & Throat Hospital, Colombo",
                "Dr. Oshadi Sampath is a consultant ENT surgeon with expertise in rhinology, " +
                "otology and head & neck surgery. She specialises in functional endoscopic " +
                "sinus surgery and cochlear implant rehabilitation.",
                3000.00, List.of("Sinhala", "English", "Tamil"))
        );
        doctorRepository.saveAll(doctors);
    }

    private Doctor doctor(String id, String userId, String email,
                          String firstName, String lastName, String phone,
                          String specialty, String qualification, String licenseNumber,
                          int experienceYears, String hospital, String bio,
                          double fee, List<String> languages) {
        Doctor d = new Doctor();
        d.setId(id);
        d.setUserId(userId);
        d.setEmail(email);
        d.setFirstName(firstName);
        d.setLastName(lastName);
        d.setPhoneNumber(phone);
        d.setSpecialty(specialty);
        d.setQualification(qualification);
        d.setLicenseNumber(licenseNumber);
        d.setExperienceYears(experienceYears);
        d.setHospital(hospital);
        d.setBio(bio);
        d.setConsultationFee(fee);
        d.setVerified(true);
        d.setAvailable(true);
        d.setRole("DOCTOR");
        d.setLanguages(languages);
        d.setDeleted(false);
        return d;
    }

    // ─── Availabilities ──────────────────────────────────────────────────────

    private void seedAvailabilities() {
        List<Availability> all = List.of(
            // ── DOC-001: Chathuri Rathnayake (Cardiology) ────────────────────
            avail("AVAIL-001-MON", "DOC-001", "MONDAY",    slots("09:00","12:30", 30, false)),
            avail("AVAIL-001-WED", "DOC-001", "WEDNESDAY", slots("14:00","17:00", 30, false)),
            avail("AVAIL-001-FRI", "DOC-001", "FRIDAY",    slots("09:00","12:00", 30, false)),

            // ── DOC-002: Dinesh Jayasuriya (Neurology) ───────────────────────
            avail("AVAIL-002-TUE", "DOC-002", "TUESDAY",   slots("10:00","13:00", 30, false)),
            avail("AVAIL-002-THU", "DOC-002", "THURSDAY",  slots("14:00","17:30", 30, false)),
            avail("AVAIL-002-SAT", "DOC-002", "SATURDAY",  slots("09:00","12:00", 30, false)),

            // ── DOC-003: Eranga Munasinghe (Orthopedic Surgery) ──────────────
            avail("AVAIL-003-MON", "DOC-003", "MONDAY",    slots("08:00","12:00", 60, false)),
            avail("AVAIL-003-WED", "DOC-003", "WEDNESDAY", slots("13:00","17:00", 60, false)),
            avail("AVAIL-003-FRI", "DOC-003", "FRIDAY",    slots("08:00","11:00", 60, false)),

            // ── DOC-004: Fathima Rizvi (Pediatrics) ──────────────────────────
            avail("AVAIL-004-MON", "DOC-004", "MONDAY",    slots("09:00","12:30", 30, false)),
            avail("AVAIL-004-TUE", "DOC-004", "TUESDAY",   slots("09:00","12:30", 30, false)),
            avail("AVAIL-004-THU", "DOC-004", "THURSDAY",  slots("14:00","17:00", 30, false)),
            avail("AVAIL-004-SAT", "DOC-004", "SATURDAY",  slots("09:00","12:00", 30, false)),

            // ── DOC-005: Gayan Siriwardena (Dermatology) ─────────────────────
            avail("AVAIL-005-TUE", "DOC-005", "TUESDAY",   slots("09:00","12:00", 30, false)),
            avail("AVAIL-005-WED", "DOC-005", "WEDNESDAY", slots("14:00","17:00", 30, false)),
            avail("AVAIL-005-FRI", "DOC-005", "FRIDAY",    slots("10:00","13:00", 30, false)),

            // ── DOC-006: Harshani Abeywickrama (Gynecology) ──────────────────
            avail("AVAIL-006-MON", "DOC-006", "MONDAY",    slots("10:00","13:00", 30, false)),
            avail("AVAIL-006-WED", "DOC-006", "WEDNESDAY", slots("14:00","18:00", 30, false)),
            avail("AVAIL-006-SAT", "DOC-006", "SATURDAY",  slots("09:00","12:30", 30, false)),

            // ── DOC-007: Ishan Peiris (Ophthalmology) ────────────────────────
            avail("AVAIL-007-TUE", "DOC-007", "TUESDAY",   slots("08:00","12:00", 30, false)),
            avail("AVAIL-007-THU", "DOC-007", "THURSDAY",  slots("13:00","17:00", 30, false)),
            avail("AVAIL-007-SAT", "DOC-007", "SATURDAY",  slots("09:00","12:00", 30, false)),

            // ── DOC-008: Janaka Dassanayake (General Medicine) ───────────────
            avail("AVAIL-008-MON", "DOC-008", "MONDAY",    slots("08:00","12:00", 20, false)),
            avail("AVAIL-008-TUE", "DOC-008", "TUESDAY",   slots("08:00","12:00", 20, false)),
            avail("AVAIL-008-WED", "DOC-008", "WEDNESDAY", slots("08:00","12:00", 20, false)),
            avail("AVAIL-008-THU", "DOC-008", "THURSDAY",  slots("08:00","12:00", 20, false)),
            avail("AVAIL-008-FRI", "DOC-008", "FRIDAY",    slots("08:00","12:00", 20, false)),

            // ── DOC-009: Kumari Samaraweera (Psychiatry) ─────────────────────
            avail("AVAIL-009-MON", "DOC-009", "MONDAY",    slots("10:00","13:00", 60, false)),
            avail("AVAIL-009-WED", "DOC-009", "WEDNESDAY", slots("14:00","17:00", 60, false)),
            avail("AVAIL-009-FRI", "DOC-009", "FRIDAY",    slots("09:00","12:00", 60, false)),

            // ── DOC-010: Lasitha Athukorala (Endocrinology) ──────────────────
            avail("AVAIL-010-TUE", "DOC-010", "TUESDAY",   slots("09:00","12:30", 30, false)),
            avail("AVAIL-010-THU", "DOC-010", "THURSDAY",  slots("14:00","17:30", 30, false)),
            avail("AVAIL-010-SAT", "DOC-010", "SATURDAY",  slots("09:00","12:00", 30, false)),

            // ── DOC-011: Malsha Wijesinghe (Gastroenterology) ────────────────
            avail("AVAIL-011-MON", "DOC-011", "MONDAY",    slots("08:30","12:00", 30, false)),
            avail("AVAIL-011-WED", "DOC-011", "WEDNESDAY", slots("13:30","17:00", 30, false)),
            avail("AVAIL-011-FRI", "DOC-011", "FRIDAY",    slots("09:00","12:30", 30, false)),

            // ── DOC-012: Nalaka Hettige (Pulmonology) ────────────────────────
            avail("AVAIL-012-TUE", "DOC-012", "TUESDAY",   slots("09:00","12:00", 30, false)),
            avail("AVAIL-012-THU", "DOC-012", "THURSDAY",  slots("14:00","17:00", 30, false)),
            avail("AVAIL-012-SAT", "DOC-012", "SATURDAY",  slots("10:00","13:00", 30, false)),

            // ── DOC-013: Oshadi Sampath (ENT) ────────────────────────────────
            avail("AVAIL-013-MON", "DOC-013", "MONDAY",    slots("09:00","12:00", 30, false)),
            avail("AVAIL-013-WED", "DOC-013", "WEDNESDAY", slots("14:00","17:30", 30, false)),
            avail("AVAIL-013-FRI", "DOC-013", "FRIDAY",    slots("09:00","12:30", 30, false))
        );
        availabilityRepository.saveAll(all);
    }

    private Availability avail(String id, String doctorId, String day,
                                List<Availability.TimeSlot> timeSlots) {
        Availability a = new Availability();
        a.setId(id);
        a.setDoctorId(doctorId);
        a.setDayOfWeek(day);
        a.setTimeSlots(timeSlots);
        a.setActive(true);
        return a;
    }

    /**
     * Generates sequential 30-minute (or custom duration) time slots.
     * @param startHhmm  e.g. "09:00"
     * @param endHhmm    e.g. "12:30"
     * @param slotMins   slot length in minutes (20, 30, or 60)
     * @param allBooked  mark all slots as booked (used for historical availability)
     */
    private List<Availability.TimeSlot> slots(String startHhmm, String endHhmm,
                                               int slotMins, boolean allBooked) {
        int startMinutes = parseMinutes(startHhmm);
        int endMinutes   = parseMinutes(endHhmm);
        java.util.List<Availability.TimeSlot> result = new java.util.ArrayList<>();
        for (int m = startMinutes; m + slotMins <= endMinutes; m += slotMins) {
            result.add(new Availability.TimeSlot(toHhmm(m), toHhmm(m + slotMins), allBooked));
        }
        return result;
    }

    private int parseMinutes(String hhmm) {
        String[] parts = hhmm.split(":");
        return Integer.parseInt(parts[0]) * 60 + Integer.parseInt(parts[1]);
    }

    private String toHhmm(int totalMinutes) {
        return String.format("%02d:%02d", totalMinutes / 60, totalMinutes % 60);
    }

    // ─── Prescriptions ───────────────────────────────────────────────────────

    private void seedPrescriptions() {
        // Prescriptions for COMPLETED appointments (SUCCESS payments).
        // patientUserId matches user-service seed.
        // patientId uses patient-service fixed UUIDs: 00000000-0000-4000-8000-0000000000XX
        List<Prescription> prescriptions = List.of(

            prescription("PRESC-001", "DOC-001", "00000000-0000-4000-8000-000000000003",
                "USR-PAT-03", "APT-SEED-1001",
                "Hypertensive Heart Disease with Left Ventricular Hypertrophy",
                "Patient presents with chronic hypertension and signs of early LVH on ECG. " +
                "Advised low-salt diet, regular aerobic exercise and strict medication adherence. " +
                "Follow-up echocardiogram in 3 months.",
                LocalDateTime.now().minusDays(79),
                List.of(
                    med("Amlodipine", "5mg", "Once daily", "90 days", "Take in the morning"),
                    med("Enalapril", "10mg", "Twice daily", "90 days", "Take with or without food"),
                    med("Aspirin", "75mg", "Once daily", "90 days", "Take after breakfast")
                )),

            prescription("PRESC-002", "DOC-002", "00000000-0000-4000-8000-000000000004",
                "USR-PAT-04", "APT-SEED-1002",
                "Tension-type Headache with Cervicogenic Component",
                "Recurrent headaches radiating from the neck consistent with cervicogenic origin. " +
                "MRI brain normal. Referred to physiotherapy. Patient counselled on ergonomic posture.",
                LocalDateTime.now().minusDays(77),
                List.of(
                    med("Naproxen Sodium", "550mg", "Twice daily as needed", "7 days",
                        "Take with food; maximum 2 doses per day"),
                    med("Amitriptyline", "10mg", "Once at bedtime", "30 days",
                        "Take 1 hour before sleep; may cause drowsiness")
                )),

            prescription("PRESC-003", "DOC-003", "00000000-0000-4000-8000-000000000005",
                "USR-PAT-05", "APT-SEED-1003",
                "Right Knee Osteoarthritis Grade II",
                "Moderate osteoarthritis of the right knee confirmed on X-ray. " +
                "Weight reduction advised. Physiotherapy referral made for quadriceps strengthening.",
                LocalDateTime.now().minusDays(75),
                List.of(
                    med("Diclofenac Sodium", "75mg", "Twice daily", "14 days",
                        "Take after meals; avoid alcohol"),
                    med("Omeprazole", "20mg", "Once daily", "14 days",
                        "Take 30 minutes before first meal"),
                    med("Glucosamine Sulphate", "1500mg", "Once daily", "90 days",
                        "Take with the largest meal of the day")
                )),

            prescription("PRESC-004", "DOC-006", "00000000-0000-4000-8000-000000000008",
                "USR-PAT-08", "APT-SEED-1006",
                "Polycystic Ovarian Syndrome (PCOS) with Irregular Cycles",
                "Ultrasound confirms polycystic ovaries with oligomenorrhoea. " +
                "HOMA-IR mildly elevated. Lifestyle modification and metformin initiated.",
                LocalDateTime.now().minusDays(69),
                List.of(
                    med("Metformin", "500mg", "Twice daily", "90 days",
                        "Take with meals; start with once daily for first week"),
                    med("Folic Acid", "5mg", "Once daily", "90 days",
                        "Take in the morning with water")
                )),

            prescription("PRESC-005", "DOC-008", "00000000-0000-4000-8000-000000000009",
                "USR-PAT-09", "APT-SEED-1008",
                "Type 2 Diabetes Mellitus – Newly Diagnosed",
                "FBS 196 mg/dL, HbA1c 8.4%. No microvascular complications on initial screening. " +
                "Diabetes education provided. Diet and exercise diary prescribed alongside pharmacotherapy.",
                LocalDateTime.now().minusDays(65),
                List.of(
                    med("Metformin", "500mg", "Twice daily", "30 days",
                        "Take with breakfast and dinner"),
                    med("Glibenclamide", "5mg", "Once daily before breakfast", "30 days",
                        "Monitor for hypoglycaemia; keep glucose tablets nearby"),
                    med("Aspirin", "75mg", "Once daily", "30 days",
                        "Take after breakfast")
                )),

            prescription("PRESC-006", "DOC-009", "00000000-0000-4000-8000-000000000010",
                "USR-PAT-10", "APT-SEED-1009",
                "Major Depressive Disorder – Moderate Severity",
                "PHQ-9 score 14. No suicidal ideation. Patient reports anhedonia, " +
                "disrupted sleep and poor concentration for 3 months. Psychotherapy referral made.",
                LocalDateTime.now().minusDays(63),
                List.of(
                    med("Escitalopram", "10mg", "Once daily", "30 days",
                        "Take in the morning; full effect may take 4-6 weeks"),
                    med("Clonazepam", "0.5mg", "Once at bedtime", "14 days",
                        "Short-term use only; do not abruptly stop")
                )),

            prescription("PRESC-007", "DOC-010", "00000000-0000-4000-8000-000000000011",
                "USR-PAT-11", "APT-SEED-1011",
                "Hypothyroidism – Primary (Hashimoto's Thyroiditis)",
                "TSH 12.4 mIU/L, free T4 low. TPO antibodies positive confirming autoimmune origin. " +
                "Thyroid ultrasound shows heterogeneous echotexture.",
                LocalDateTime.now().minusDays(59),
                List.of(
                    med("Levothyroxine", "50mcg", "Once daily", "90 days",
                        "Take on empty stomach 30-60 minutes before breakfast"),
                    med("Calcium Carbonate", "500mg", "Twice daily", "90 days",
                        "Take at least 4 hours apart from Levothyroxine")
                )),

            prescription("PRESC-008", "DOC-011", "00000000-0000-4000-8000-000000000012",
                "USR-PAT-12", "APT-SEED-1012",
                "Acute Gastritis with Helicobacter pylori Infection",
                "Rapid urease test positive. Triple eradication therapy initiated. " +
                "Patient advised to avoid NSAIDs, alcohol and spicy foods.",
                LocalDateTime.now().minusDays(57),
                List.of(
                    med("Amoxicillin", "1000mg", "Twice daily", "14 days",
                        "Take with food to reduce GI upset"),
                    med("Clarithromycin", "500mg", "Twice daily", "14 days",
                        "Complete full course even if symptoms improve"),
                    med("Omeprazole", "20mg", "Twice daily", "14 days",
                        "Take 30 minutes before meals"),
                    med("Metronidazole", "400mg", "Thrice daily", "7 days",
                        "Take with food; avoid alcohol completely")
                )),

            prescription("PRESC-009", "DOC-012", "00000000-0000-4000-8000-000000000013",
                "USR-PAT-13", "APT-SEED-1013",
                "Bronchial Asthma – Mild Persistent",
                "Spirometry FEV1 78% predicted, post-bronchodilator reversibility 15%. " +
                "Patient symptomatic 2-3 days per week. Step-up therapy initiated.",
                LocalDateTime.now().minusDays(55),
                List.of(
                    med("Budesonide/Formoterol Inhaler", "160/4.5mcg", "One puff twice daily",
                        "90 days", "Rinse mouth with water after each use"),
                    med("Salbutamol Inhaler", "100mcg", "2 puffs as needed",
                        "90 days", "Reliever inhaler — use only when symptomatic")
                )),

            prescription("PRESC-010", "DOC-013", "00000000-0000-4000-8000-000000000014",
                "USR-PAT-14", "APT-SEED-1016",
                "Chronic Sinusitis with Nasal Polyps – Grade I",
                "CT paranasal sinuses shows bilateral mucosal thickening and small polyps. " +
                "Functional endoscopic sinus surgery deferred; conservative management initiated.",
                LocalDateTime.now().minusDays(47),
                List.of(
                    med("Mometasone Nasal Spray", "50mcg", "2 sprays each nostril once daily",
                        "90 days", "Blow nose before use; direct spray away from septum"),
                    med("Cetirizine", "10mg", "Once daily at night", "30 days",
                        "May cause drowsiness"),
                    med("Saline Nasal Rinse", "240ml", "Once daily", "90 days",
                        "Use isotonic saline; warm to body temperature")
                )),

            prescription("PRESC-011", "DOC-001", "00000000-0000-4000-8000-000000000003",
                "USR-PAT-03", "APT-SEED-1027",
                "Cardiac Arrhythmia – Paroxysmal Atrial Fibrillation",
                "24-hour Holter shows paroxysmal AF episodes lasting 4-6 hours. " +
                "CHA₂DS₂-VASc score 2; anticoagulation initiated. Cardiology follow-up in 4 weeks.",
                LocalDateTime.now().minusDays(23),
                List.of(
                    med("Rivaroxaban", "20mg", "Once daily with evening meal", "30 days",
                        "Do not crush or chew; take with largest meal"),
                    med("Bisoprolol", "5mg", "Once daily", "30 days",
                        "Do not stop abruptly; monitor heart rate"),
                    med("Digoxin", "0.25mg", "Once daily", "30 days",
                        "Check pulse before each dose; hold if <60 bpm")
                )),

            prescription("PRESC-012", "DOC-005", "00000000-0000-4000-8000-000000000015",
                "USR-PAT-15", "APT-SEED-1026",
                "Moderate Acne Vulgaris with Post-Inflammatory Hyperpigmentation",
                "Comedonal and inflammatory acne on face and upper back. " +
                "Patient counselled on gentle skincare routine and sun protection.",
                LocalDateTime.now().minusDays(24),
                List.of(
                    med("Doxycycline", "100mg", "Once daily", "60 days",
                        "Take with a full glass of water; avoid lying down for 30 minutes"),
                    med("Adapalene 0.1% Gel", "Apply pea-sized amount", "Once nightly",
                        "90 days", "Apply to clean dry skin; use sunscreen daily"),
                    med("Clindamycin 1% Lotion", "Apply to affected areas", "Twice daily",
                        "60 days", "Apply a thin layer; avoid eyes and mucous membranes")
                )),

            prescription("PRESC-013", "DOC-003", "00000000-0000-4000-8000-000000000016",
                "USR-PAT-16", "APT-SEED-1041",
                "Right Ankle Ligament Sprain Grade II with Syndesmotic Involvement",
                "MRI-confirmed ATFL complete tear and partial CFL tear. " +
                "Non-surgical management initiated with physiotherapy referral. " +
                "Patient advised strict rest, ice, compression and elevation for first 72 hours.",
                LocalDateTime.now().minusDays(6),
                List.of(
                    med("Diclofenac Sodium", "75mg", "Twice daily", "7 days",
                        "Take after meals; avoid alcohol and prolonged use"),
                    med("Pantoprazole", "40mg", "Once daily before breakfast", "7 days",
                        "Gastroprotection while on NSAID therapy"),
                    med("Paracetamol", "1000mg", "Three times daily as needed", "5 days",
                        "Do not exceed 4g per day; avoid alcohol")
                ))
        );
        prescriptionRepository.saveAll(prescriptions);
    }

    private Prescription prescription(String id, String doctorId, String patientId,
                                       String patientUserId, String appointmentId,
                                       String diagnosis, String notes,
                                       LocalDateTime issuedAt,
                                       List<Prescription.Medicine> medicines) {
        Prescription p = new Prescription();
        p.setId(id);
        p.setDoctorId(doctorId);
        p.setPatientId(patientId);
        p.setPatientUserId(patientUserId);
        p.setAppointmentId(appointmentId);
        p.setDiagnosis(diagnosis);
        p.setNotes(notes);
        p.setMedicines(medicines);
        p.setIssuedAt(issuedAt);
        p.setValidUntil(issuedAt.plusDays(90));
        return p;
    }

    private Prescription.Medicine med(String name, String dosage, String frequency,
                                       String duration, String instructions) {
        return new Prescription.Medicine(name, dosage, frequency, duration, instructions);
    }
}
