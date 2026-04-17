package com.edoc.appointmentservice.config;

import com.edoc.appointmentservice.model.Appointment;
import com.edoc.appointmentservice.repository.AppointmentRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * Seeds the appointment-service MongoDB collection on every startup (drops existing data first).
 *
 * Data design:
 * - 40 appointments: APT-SEED-1001 .. APT-SEED-1040 (13-patient cycle)\n * - 3  appointments: APT-SEED-1041 .. APT-SEED-1043 (Lehan Navaratne, USR-PAT-16)
 * - Patient cycling: USR-PAT-03 through USR-PAT-15 (13 active patients)
 * - Doctor cycling:  DOC-001 through DOC-013 (13 active doctors, doctor-service)
 * - Patient UUID uses patient-service fixed seed UUIDs: 00000000-0000-4000-8000-0000000000XX
 * - Payment amounts and statuses mirror payment-service seed exactly:
 *     gs % 7 == 0 → FAILED   (gs: 7,14,21,28,35)
 *     gs % 5 == 0 → PENDING  (gs: 5,10,15,20,25,30,40)
 *     else        → SUCCESS
 * - Even gs → IN_PERSON (LKR fee),  Odd gs → VIDEO (USD fee)
 * - Payment UUIDs computed from md5("pmt-N") to match payment-service row IDs
 */
@Component
public class DataInitializer implements ApplicationRunner {

    private final AppointmentRepository appointmentRepository;

    @Value("${seed.enabled:false}")
    private boolean seedEnabled;

    public DataInitializer(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!seedEnabled) return;
        appointmentRepository.deleteAll();
        appointmentRepository.saveAll(buildAppointments());
    }

    private List<Appointment> buildAppointments() {
        // Reference data arrays (indexed 0-based, use (gs-1) % 13)
        String[] patUserIds = {
            "USR-PAT-03","USR-PAT-04","USR-PAT-05","USR-PAT-06","USR-PAT-07",
            "USR-PAT-08","USR-PAT-09","USR-PAT-10","USR-PAT-11","USR-PAT-12",
            "USR-PAT-13","USR-PAT-14","USR-PAT-15"
        };
        String[] patNames = {
            "Vimukthi Rathnasiri","Wasantha Alwis","Yasiru Vithanage","Amali Udagedara",
            "Binara Harshana","Chamila Sampath","Danushka Samarakoon","Erandi Wickremaratne",
            "Farhan Saleem","Gimhan Perera","Hasitha Jayasena","Indika Kumara",
            "Janani Thilakarathne"
        };
        String[] patEmails = {
            "vimukthi.rathnasiri@edoc.com","wasantha.alwis@edoc.com","yasiru.vithanage@edoc.com",
            "amali.udagedara@edoc.com","binara.harshana@edoc.com","chamila.sampath@edoc.com",
            "danushka.samarakoon@edoc.com","erandi.wickremaratne@edoc.com","farhan.saleem@edoc.com",
            "gimhan.perera@edoc.com","hasitha.jayasena@edoc.com","indika.kumara@edoc.com",
            "janani.thilakarathne@edoc.com"
        };
        String[] patPhones = {
            "0733300003","0744400004","0755500005","0766600006","0777700007",
            "0788800008","0711900009","0722000010","0733100011","0744200012",
            "0755300013","0766400014","0777500015"
        };
        // patient-service fixed seed UUIDs: 00000000-0000-4000-8000-0000000000XX (XX = 03..15)
        String[] patServiceIds = {
            "00000000-0000-4000-8000-000000000003","00000000-0000-4000-8000-000000000004",
            "00000000-0000-4000-8000-000000000005","00000000-0000-4000-8000-000000000006",
            "00000000-0000-4000-8000-000000000007","00000000-0000-4000-8000-000000000008",
            "00000000-0000-4000-8000-000000000009","00000000-0000-4000-8000-000000000010",
            "00000000-0000-4000-8000-000000000011","00000000-0000-4000-8000-000000000012",
            "00000000-0000-4000-8000-000000000013","00000000-0000-4000-8000-000000000014",
            "00000000-0000-4000-8000-000000000015"
        };

        // Doctor reference arrays (DOC-001..DOC-013)
        String[] docIds = {
            "DOC-001","DOC-002","DOC-003","DOC-004","DOC-005","DOC-006","DOC-007",
            "DOC-008","DOC-009","DOC-010","DOC-011","DOC-012","DOC-013"
        };
        String[] docNames = {
            "Dr. Chathuri Rathnayake","Dr. Dinesh Jayasuriya","Dr. Eranga Munasinghe",
            "Dr. Fathima Rizvi","Dr. Gayan Siriwardena","Dr. Harshani Abeywickrama",
            "Dr. Ishan Peiris","Dr. Janaka Dassanayake","Dr. Kumari Samaraweera",
            "Dr. Lasitha Athukorala","Dr. Malsha Wijesinghe","Dr. Nalaka Hettige",
            "Dr. Oshadi Sampath"
        };
        String[] docSpecialties = {
            "Cardiology","Neurology","Orthopedic Surgery","Pediatrics","Dermatology",
            "Obstetrics & Gynecology","Ophthalmology","General Medicine","Psychiatry",
            "Endocrinology","Gastroenterology","Pulmonology","ENT"
        };
        String[] docHospitals = {
            "Nawaloka Hospital, Colombo","Lanka Hospitals, Colombo",
            "Asiri Surgical Hospital, Colombo","Sirimavo Bandaranaike Hospital, Colombo",
            "Ninewells Hospital, Colombo","Durdans Hospital, Colombo",
            "National Eye Hospital, Colombo","Colombo South Teaching Hospital",
            "National Institute of Mental Health, Mulleriyawa","Teaching Hospital, Kandy",
            "Asiri Central Hospital, Colombo","Chest Hospital, Welisara",
            "Eye Ear Nose & Throat Hospital, Colombo"
        };

        // Time slots used for appointments (cycle by gs index)
        String[] timeSlots = {
            "09:00-09:30","09:30-10:00","10:00-10:30","10:30-11:00","11:00-11:30",
            "11:30-12:00","14:00-14:30","14:30-15:00","15:00-15:30","15:30-16:00"
        };
        String[] daysOfWeek = {
            "MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY",
            "MONDAY","TUESDAY","WEDNESDAY","THURSDAY"
        };

        String[] reasonsForVisit = {
            "Chest pain and shortness of breath during exertion",
            "Persistent headache and dizziness for two weeks",
            "Right knee pain and difficulty walking",
            "Fever and cough in child (age 6)",
            "Skin rash and itching on arms and legs",
            "Irregular menstrual cycles and pelvic pain",
            "Blurred vision and eye strain",
            "High blood sugar and fatigue",
            "Anxiety, low mood and sleep disturbances",
            "Weight gain and hair loss",
            "Abdominal pain and bloating after meals",
            "Chronic cough and wheezing",
            "Ear pain and hearing difficulty",
            "Follow-up after cardiac evaluation",
            "Migraine management review",
            "Post-operative knee physiotherapy assessment",
            "Child vaccination and growth monitoring",
            "Acne treatment review and medication adjustment",
            "Antenatal check-up at 28 weeks",
            "Eye pressure check for glaucoma monitoring",
            "Diabetes management and HbA1c review",
            "Monthly psychotherapy follow-up",
            "Thyroid function test review",
            "IBS management and colonoscopy discussion",
            "COPD exacerbation management",
            "Sinus congestion and nasal polyp review",
            "Hypertension and heart failure follow-up",
            "Back pain and disc herniation assessment",
            "Allergic rhinitis and eczema",
            "Uterine fibroid review",
            "Retinal detachment screening",
            "Pre-diabetes lifestyle counselling",
            "Panic disorder and medication titration",
            "Diabetic nephropathy monitoring",
            "Acid reflux and GERD management",
            "Sleep apnoea assessment and CPAP review",
            "Tonsillitis and throat infection",
            "Cardiac stress test follow-up",
            "Epilepsy review and medication adjustment",
            "Sports injury rehabilitation consultation"
        };

        List<Appointment> appointments = new ArrayList<>();
        // Base date: 80 days ago; each appointment is ~2 days apart
        LocalDate baseDate = LocalDate.now().minusDays(80);

        for (int gs = 1; gs <= 40; gs++) {
            int idx = (gs - 1) % 13;
            int docIdx = (gs - 1) % 13;
            int reasonIdx = gs - 1;

            Appointment.PaymentStatus paymentStatus;
            if (gs % 7 == 0) {
                paymentStatus = Appointment.PaymentStatus.FAILED;
            } else if (gs % 5 == 0) {
                paymentStatus = Appointment.PaymentStatus.PENDING;
            } else {
                paymentStatus = Appointment.PaymentStatus.SUCCESS;
            }

            Appointment.AppointmentType type = (gs % 2 == 0)
                ? Appointment.AppointmentType.IN_PERSON
                : Appointment.AppointmentType.VIDEO;

            // Consultation fee in LKR — matches payment-service seed: 1200 + gs * 190
            double consultationFee = Math.round((1200.0 + gs * 190.0) * 100.0) / 100.0;

            // Appointment date: spaced ~2 days apart from base
            LocalDate appointmentDate = baseDate.plusDays((long) (gs - 1) * 2);
            LocalDateTime createdAt = appointmentDate.atTime(7, 30);
            LocalDateTime updatedAt = appointmentDate.atTime(8, 0);

            // Appointment status derived from payment status and date
            Appointment.AppointmentStatus status;
            if (paymentStatus == Appointment.PaymentStatus.FAILED) {
                status = Appointment.AppointmentStatus.CANCELLED;
            } else if (paymentStatus == Appointment.PaymentStatus.PENDING) {
                status = appointmentDate.isBefore(LocalDate.now())
                    ? Appointment.AppointmentStatus.CONFIRMED
                    : Appointment.AppointmentStatus.PENDING;
            } else {
                // SUCCESS
                status = appointmentDate.isBefore(LocalDate.now())
                    ? Appointment.AppointmentStatus.COMPLETED
                    : Appointment.AppointmentStatus.CONFIRMED;
            }

            // Doctor notes for COMPLETED appointments
            String doctorNotes = null;
            if (status == Appointment.AppointmentStatus.COMPLETED) {
                doctorNotes = buildDoctorNotes(docSpecialties[docIdx], gs);
            }

            // Cancellation reason for CANCELLED appointments
            String cancellationReason = null;
            if (status == Appointment.AppointmentStatus.CANCELLED) {
                cancellationReason = "Payment failed — appointment automatically cancelled. Patient may rebook.";
            }

            // Video session link for VIDEO appointments that are CONFIRMED or COMPLETED
            String videoSessionLink = null;
            if (type == Appointment.AppointmentType.VIDEO
                    && (status == Appointment.AppointmentStatus.CONFIRMED
                        || status == Appointment.AppointmentStatus.COMPLETED)) {
                videoSessionLink = "https://video.edoc.lk/appointment-APT-SEED-" + (1000 + gs);
            }

            // Payment ID: md5("pmt-N") formatted as UUID — matches payment-service row
            String paymentId = null;
            LocalDateTime paymentDate = null;
            if (paymentStatus == Appointment.PaymentStatus.SUCCESS) {
                paymentId = md5Uuid("pmt-" + gs);
                paymentDate = appointmentDate.atTime(8, 8);
            }

            Appointment a = new Appointment();
            a.setId("APT-SEED-" + (1000 + gs));
            a.setPatientId(patServiceIds[idx]);
            a.setPatientUserId(patUserIds[idx]);
            a.setPatientName(patNames[idx]);
            a.setPatientEmail(patEmails[idx]);
            a.setPatientPhone(patPhones[idx]);
            a.setDoctorId(docIds[docIdx]);
            a.setDoctorName(docNames[docIdx]);
            a.setDoctorSpecialty(docSpecialties[docIdx]);
            a.setDoctorHospital(docHospitals[docIdx]);
            a.setConsultationFee(consultationFee);
            a.setAppointmentDate(appointmentDate);
            a.setTimeSlot(timeSlots[gs % 10]);
            a.setDayOfWeek(daysOfWeek[gs % 10]);
            a.setType(type);
            a.setStatus(status);
            a.setReasonForVisit(reasonsForVisit[reasonIdx]);
            a.setDoctorNotes(doctorNotes);
            a.setCancellationReason(cancellationReason);
            a.setVideoSessionLink(videoSessionLink);
            a.setPaymentStatus(paymentStatus);
            a.setPaymentId(paymentId);
            a.setPaymentDate(paymentDate);
            a.setCreatedAt(createdAt);
            a.setUpdatedAt(updatedAt);

            appointments.add(a);
        }

        // ── Lehan Navaratne (USR-PAT-16) – 3 explicit appointments ────────────
        final String lehanId     = "00000000-0000-4000-8000-000000000016";
        final String lehanUserId = "USR-PAT-16";
        final String lehanName   = "Lehan Navaratne";
        final String lehanEmail  = "lehanxp@gmail.com";
        final String lehanPhone  = "0788600016";

        // APT-SEED-1041: IN_PERSON, SUCCESS/COMPLETED, DOC-003 (Orthopedic Surgery)
        LocalDate l1Date = LocalDate.now().minusDays(6);
        Appointment l1 = new Appointment();
        l1.setId("APT-SEED-1041");
        l1.setPatientId(lehanId);      l1.setPatientUserId(lehanUserId);
        l1.setPatientName(lehanName);  l1.setPatientEmail(lehanEmail);
        l1.setPatientPhone(lehanPhone);
        l1.setDoctorId("DOC-003");     l1.setDoctorName("Dr. Eranga Munasinghe");
        l1.setDoctorSpecialty("Orthopedic Surgery");
        l1.setDoctorHospital("Asiri Surgical Hospital, Colombo");
        l1.setConsultationFee(8990.00);
        l1.setAppointmentDate(l1Date); l1.setTimeSlot("10:00-10:30");
        l1.setDayOfWeek(l1Date.getDayOfWeek().name());
        l1.setType(Appointment.AppointmentType.IN_PERSON);
        l1.setStatus(Appointment.AppointmentStatus.COMPLETED);
        l1.setReasonForVisit("Sports injury rehabilitation consultation");
        l1.setDoctorNotes("Range of motion improved post-physiotherapy. " +
            "X-ray shows no new changes. Continue exercises; " +
            "surgical review if no further improvement.");
        l1.setPaymentStatus(Appointment.PaymentStatus.SUCCESS);
        l1.setPaymentId(md5Uuid("pmt-41"));
        l1.setPaymentDate(l1Date.atTime(8, 8));
        l1.setCreatedAt(l1Date.atTime(7, 30));
        l1.setUpdatedAt(l1Date.atTime(8, 0));
        appointments.add(l1);

        // APT-SEED-1042: VIDEO, SUCCESS/COMPLETED, DOC-007 (Ophthalmology)
        LocalDate l2Date = LocalDate.now().minusDays(3);
        Appointment l2 = new Appointment();
        l2.setId("APT-SEED-1042");
        l2.setPatientId(lehanId);      l2.setPatientUserId(lehanUserId);
        l2.setPatientName(lehanName);  l2.setPatientEmail(lehanEmail);
        l2.setPatientPhone(lehanPhone);
        l2.setDoctorId("DOC-007");     l2.setDoctorName("Dr. Ishan Peiris");
        l2.setDoctorSpecialty("Ophthalmology");
        l2.setDoctorHospital("National Eye Hospital, Colombo");
        l2.setConsultationFee(9180.00);
        l2.setAppointmentDate(l2Date); l2.setTimeSlot("14:30-15:00");
        l2.setDayOfWeek(l2Date.getDayOfWeek().name());
        l2.setType(Appointment.AppointmentType.VIDEO);
        l2.setStatus(Appointment.AppointmentStatus.COMPLETED);
        l2.setReasonForVisit("Blurred vision and eye strain");
        l2.setDoctorNotes("Visual acuity stable. IOP within normal range. " +
            "Fundus examination normal. Next review in 12 months.");
        l2.setVideoSessionLink("https://video.edoc.lk/appointment-APT-SEED-1042");
        l2.setPaymentStatus(Appointment.PaymentStatus.SUCCESS);
        l2.setPaymentId(md5Uuid("pmt-42"));
        l2.setPaymentDate(l2Date.atTime(8, 8));
        l2.setCreatedAt(l2Date.atTime(7, 30));
        l2.setUpdatedAt(l2Date.atTime(8, 0));
        appointments.add(l2);

        // APT-SEED-1043: IN_PERSON, PENDING/CONFIRMED (upcoming), DOC-009 (Psychiatry)
        LocalDate l3Date = LocalDate.now().plusDays(2);
        Appointment l3 = new Appointment();
        l3.setId("APT-SEED-1043");
        l3.setPatientId(lehanId);      l3.setPatientUserId(lehanUserId);
        l3.setPatientName(lehanName);  l3.setPatientEmail(lehanEmail);
        l3.setPatientPhone(lehanPhone);
        l3.setDoctorId("DOC-009");     l3.setDoctorName("Dr. Kumari Samaraweera");
        l3.setDoctorSpecialty("Psychiatry");
        l3.setDoctorHospital("National Institute of Mental Health, Mulleriyawa");
        l3.setConsultationFee(9370.00);
        l3.setAppointmentDate(l3Date); l3.setTimeSlot("11:00-11:30");
        l3.setDayOfWeek(l3Date.getDayOfWeek().name());
        l3.setType(Appointment.AppointmentType.IN_PERSON);
        l3.setStatus(Appointment.AppointmentStatus.CONFIRMED);
        l3.setReasonForVisit("Anxiety, low mood and sleep disturbances");
        l3.setPaymentStatus(Appointment.PaymentStatus.PENDING);
        l3.setCreatedAt(l3Date.atTime(7, 30).minusDays(1));
        l3.setUpdatedAt(l3Date.atTime(7, 30).minusDays(1));
        appointments.add(l3);

        return appointments;
    }

    /**
     * Generates a UUID string by formatting md5(input) identically to the payment-service seed:
     * substr(md5('pmt-' || gs), 1,8) || '-' || substr(9,4) || '-' || substr(13,4)
     *                                       || '-' || substr(17,4) || '-' || substr(21,12)
     */
    private String md5Uuid(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] hash = md.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(32);
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            String h = hex.toString();
            return h.substring(0, 8) + "-" + h.substring(8, 12) + "-"
                + h.substring(12, 16) + "-" + h.substring(16, 20) + "-" + h.substring(20, 32);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("MD5 not available", e);
        }
    }

    private String buildDoctorNotes(String specialty, int gs) {
        return switch (specialty) {
            case "Cardiology" -> "ECG and echo reviewed. BP well-controlled at 128/82 mmHg. " +
                "Continue current medications. Repeat Holter in 3 months.";
            case "Neurology" -> "Neurological examination normal. Headache frequency reduced with " +
                "current therapy. No new focal deficits. Follow-up in 6 weeks.";
            case "Orthopedic Surgery" -> "Range of motion improved post-physiotherapy. " +
                "X-ray shows no new changes. Continue exercises; surgical review if no further improvement.";
            case "Pediatrics" -> "Child appears well-nourished and developmentally appropriate. " +
                "Vaccinations up to date. No acute illness detected. Review in 3 months.";
            case "Dermatology" -> "Skin condition responding to topical therapy. " +
                "Lesions reduced by approximately 60%. Sun protection reinforced. Review in 6 weeks.";
            case "Obstetrics & Gynecology" -> "Examination satisfactory. Ultrasound findings noted. " +
                "Medication tolerated well. Follow-up in 4 weeks with repeat labs.";
            case "Ophthalmology" -> "Visual acuity stable. IOP within normal range. " +
                "Fundus examination normal. Next review in 12 months.";
            case "General Medicine" -> "Blood pressure and blood sugar within target range. " +
                "HbA1c improved to 6.8%. Medication compliance confirmed. Continue current regimen.";
            case "Psychiatry" -> "Patient reports improvement in mood and sleep. " +
                "PHQ-9 score down to 8. Continue current medication. Psychotherapy ongoing.";
            case "Endocrinology" -> "TSH normalised at 2.1 mIU/L. Free T4 within range. " +
                "Patient tolerating Levothyroxine well. Repeat TFT in 6 months.";
            case "Gastroenterology" -> "Symptoms significantly improved. " +
                "Upper endoscopy findings reviewed. H. pylori eradication confirmed. " +
                "Lifestyle modifications reinforced.";
            case "Pulmonology" -> "Spirometry improved post-treatment. FEV1 now 85% predicted. " +
                "Inhaler technique assessed and corrected. Exacerbation frequency reduced.";
            case "ENT" -> "Nasal endoscopy shows reduced polyp size. " +
                "Hearing test normal. Continue nasal spray and antihistamine. Review CT in 6 months.";
            default -> "Consultation completed. Patient examined and reviewed. " +
                "Medications adjusted. Follow-up as scheduled.";
        };
    }
}
