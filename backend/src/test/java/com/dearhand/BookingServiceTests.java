package com.dearhand;

import com.dearhand.dto.booking.BookingRequest;
import com.dearhand.dto.booking.CancelBookingRequest;
import com.dearhand.dto.parent.ParentRequest;
import com.dearhand.entity.Booking;
import com.dearhand.entity.CarePackage;
import com.dearhand.entity.Parent;
import com.dearhand.entity.User;
import com.dearhand.enums.BookingStatus;
import com.dearhand.enums.PackageType;
import com.dearhand.enums.Role;
import com.dearhand.enums.UserStatus;
import com.dearhand.repository.BookingRepository;
import com.dearhand.repository.PackageRepository;
import com.dearhand.repository.ParentRepository;
import com.dearhand.repository.UserRepository;
import com.dearhand.security.JwtTokenProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class BookingServiceTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ParentRepository parentRepository;

    @Autowired
    private PackageRepository packageRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private User family1;
    private User family2;
    private CarePackage taskPackage;
    private String family1Jwt;
    private String family2Jwt;

    @BeforeEach
    void setUp() {
        family1 = userRepository.save(User.builder()
                .name("Kavitha Rao")
                .email("kavitha.rao@example.com")
                .phone("+919988112233")
                .passwordHash(passwordEncoder.encode("Pass123!"))
                .role(Role.FAMILY)
                .status(UserStatus.ACTIVE)
                .build());

        family2 = userRepository.save(User.builder()
                .name("Sunil Verma")
                .email("sunil.verma@example.com")
                .phone("+919988112244")
                .passwordHash(passwordEncoder.encode("Pass123!"))
                .role(Role.FAMILY)
                .status(UserStatus.ACTIVE)
                .build());

        taskPackage = packageRepository.save(CarePackage.builder()
                .name("Single Task (2 Hours)")
                .type(PackageType.TASK)
                .durationHours(2)
                .basePrice(BigDecimal.valueOf(499.00))
                .active(true)
                .build());

        family1Jwt = jwtTokenProvider.generateToken(family1.getId(), family1.getEmail(), family1.getRole());
        family2Jwt = jwtTokenProvider.generateToken(family2.getId(), family2.getEmail(), family2.getRole());
    }

    @Test
    @DisplayName("POST /api/v1/parents - Family creates parent profile")
    void shouldCreateParentProfile() throws Exception {
        ParentRequest request = ParentRequest.builder()
                .name("Mr. Gopal Rao")
                .age(75)
                .address("15, Gokulam 3rd Stage, Mysuru")
                .city("Mysuru")
                .language("Kannada")
                .careNotes("Mild arthritis, needs arm support when walking")
                .medicalHistory("Hypertension (10 yrs), Type 2 Diabetes, on Metformin and Telmisartan. No known drug allergies.")
                .emergencyContactName("Kavitha Rao")
                .emergencyContactPhone("+919988112233")
                .build();

        mockMvc.perform(post("/api/v1/parents")
                .header("Authorization", "Bearer " + family1Jwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Mr. Gopal Rao"))
                .andExpect(jsonPath("$.city").value("Mysuru"))
                .andExpect(jsonPath("$.age").value(75))
                .andExpect(jsonPath("$.medicalHistory").value("Hypertension (10 yrs), Type 2 Diabetes, on Metformin and Telmisartan. No known drug allergies."));
    }

    @Test
    @DisplayName("PUT /api/v1/parents/{id} - Family updates parent profile including medical history")
    void shouldUpdateParentProfileWithMedicalHistory() throws Exception {
        Parent parent = parentRepository.save(Parent.builder()
                .familyUser(family1)
                .name("Mrs. Lakshmi")
                .age(71)
                .address("Kuvempunagar, Mysuru")
                .city("Mysuru")
                .language("Kannada")
                .careNotes("Requires walking support")
                .medicalHistory("Initial: mild hypertension")
                .emergencyContactName("Kavitha Rao")
                .emergencyContactPhone("+919988112233")
                .build());

        ParentRequest updateReq = ParentRequest.builder()
                .name("Mrs. Lakshmi")
                .age(71)
                .address("Kuvempunagar, Mysuru")
                .city("Mysuru")
                .language("Kannada")
                .careNotes("Requires walking support and evening medication reminder")
                .medicalHistory("Hypertension, Asthma (uses Inhaler as needed), Penicillin allergy")
                .emergencyContactName("Kavitha Rao")
                .emergencyContactPhone("+919988112233")
                .build();

        mockMvc.perform(put("/api/v1/parents/" + parent.getId())
                .header("Authorization", "Bearer " + family1Jwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.medicalHistory").value("Hypertension, Asthma (uses Inhaler as needed), Penicillin allergy"))
                .andExpect(jsonPath("$.careNotes").value("Requires walking support and evening medication reminder"));
    }

    @Test
    @DisplayName("PUT /api/v1/parents/{id} - Wrong family member modifying another parent profile is refused with 403")
    void shouldRefuseWrongFamilyModifyingParent() throws Exception {
        Parent parent1 = parentRepository.save(Parent.builder()
                .familyUser(family1)
                .name("Mrs. Shakuntala")
                .age(70)
                .address("Saraswathipuram, Mysuru")
                .emergencyContactName("Kavitha")
                .emergencyContactPhone("+919988112233")
                .build());

        ParentRequest updateReq = ParentRequest.builder()
                .name("Hacked Name")
                .age(71)
                .address("Fake Address")
                .emergencyContactName("Sunil")
                .emergencyContactPhone("+919988112244")
                .build();

        mockMvc.perform(put("/api/v1/parents/" + parent1.getId())
                .header("Authorization", "Bearer " + family2Jwt) // Family 2 trying to modify Family 1's parent
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("POST /api/v1/bookings - Family requests booking with parent and package")
    void shouldCreateBooking() throws Exception {
        Parent parent = parentRepository.save(Parent.builder()
                .familyUser(family1)
                .name("Mr. Gopal Rao")
                .age(75)
                .address("Gokulam, Mysuru")
                .emergencyContactName("Kavitha")
                .emergencyContactPhone("+919988112233")
                .build());

        BookingRequest request = BookingRequest.builder()
                .parentId(parent.getId())
                .packageId(taskPackage.getId())
                .scheduledStart(Instant.now().plus(2, ChronoUnit.DAYS))
                .address("Gokulam, Mysuru")
                .taskNotes("Escort to bank work and medical store pickup")
                .build();

        mockMvc.perform(post("/api/v1/bookings")
                .header("Authorization", "Bearer " + family1Jwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("REQUESTED"))
                .andExpect(jsonPath("$.totalAmount").value(499.00))
                .andExpect(jsonPath("$.paymentStatus").value("PENDING"));
    }

    @Test
    @DisplayName("POST /api/v1/bookings/{id}/cancel - Family cancels booking in REQUESTED state")
    void shouldCancelBookingInRequestedState() throws Exception {
        Parent parent = parentRepository.save(Parent.builder()
                .familyUser(family1)
                .name("Mr. Gopal Rao")
                .age(75)
                .address("Gokulam, Mysuru")
                .emergencyContactName("Kavitha")
                .emergencyContactPhone("+919988112233")
                .build());

        Booking booking = bookingRepository.save(Booking.builder()
                .family(family1)
                .parent(parent)
                .carePackage(taskPackage)
                .scheduledStart(Instant.now().plus(1, ChronoUnit.DAYS))
                .scheduledEnd(Instant.now().plus(1, ChronoUnit.DAYS).plus(2, ChronoUnit.HOURS))
                .address("Gokulam, Mysuru")
                .status(BookingStatus.REQUESTED)
                .totalAmount(BigDecimal.valueOf(499.00))
                .build());

        CancelBookingRequest cancelReq = CancelBookingRequest.builder()
                .reason("Change of plans, visiting in person")
                .build();

        mockMvc.perform(post("/api/v1/bookings/" + booking.getId() + "/cancel")
                .header("Authorization", "Bearer " + family1Jwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(cancelReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));
    }

    @Test
    @DisplayName("POST /api/v1/bookings/{id}/cancel - Reject invalid status transition when IN_PROGRESS with HTTP 400")
    void shouldRejectCancellationWhenInProgress() throws Exception {
        Parent parent = parentRepository.save(Parent.builder()
                .familyUser(family1)
                .name("Mr. Gopal Rao")
                .age(75)
                .address("Gokulam, Mysuru")
                .emergencyContactName("Kavitha")
                .emergencyContactPhone("+919988112233")
                .build());

        Booking booking = bookingRepository.save(Booking.builder()
                .family(family1)
                .parent(parent)
                .carePackage(taskPackage)
                .scheduledStart(Instant.now().minus(1, ChronoUnit.HOURS))
                .scheduledEnd(Instant.now().plus(1, ChronoUnit.HOURS))
                .address("Gokulam, Mysuru")
                .status(BookingStatus.IN_PROGRESS) // Already in progress!
                .totalAmount(BigDecimal.valueOf(499.00))
                .build());

        mockMvc.perform(post("/api/v1/bookings/" + booking.getId() + "/cancel")
                .header("Authorization", "Bearer " + family1Jwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new CancelBookingRequest("Emergency stop"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Cannot cancel booking in IN_PROGRESS status. Visits in progress or completed cannot be cancelled."));
    }

    @Test
    @DisplayName("GET /api/v1/bookings/{id} - Unrelated family accessing someone else's booking is refused with 403")
    void shouldRefuseWrongFamilyAccessingBooking() throws Exception {
        Parent parent = parentRepository.save(Parent.builder()
                .familyUser(family1)
                .name("Mr. Gopal Rao")
                .age(75)
                .address("Gokulam, Mysuru")
                .emergencyContactName("Kavitha")
                .emergencyContactPhone("+919988112233")
                .build());

        Booking booking = bookingRepository.save(Booking.builder()
                .family(family1)
                .parent(parent)
                .carePackage(taskPackage)
                .scheduledStart(Instant.now().plus(1, ChronoUnit.DAYS))
                .scheduledEnd(Instant.now().plus(1, ChronoUnit.DAYS).plus(2, ChronoUnit.HOURS))
                .address("Gokulam, Mysuru")
                .status(BookingStatus.REQUESTED)
                .totalAmount(BigDecimal.valueOf(499.00))
                .build());

        mockMvc.perform(get("/api/v1/bookings/" + booking.getId())
                .header("Authorization", "Bearer " + family2Jwt)) // Family 2
                .andExpect(status().isForbidden());
    }
}
