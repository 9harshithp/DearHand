# Build stage
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Build application
COPY src ./src
RUN mvn clean package -DskipTests -B

# Runtime stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Create non-root user for security
RUN addgroup -S dearhand && adduser -S dearhand -G dearhand
USER dearhand

COPY --from=builder --chown=dearhand:dearhand /app/target/dearhand-backend-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080 10000

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
