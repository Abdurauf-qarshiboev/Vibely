# Builder stage
FROM eclipse-temurin:21-jdk-jammy AS builder
WORKDIR /opt/app

# Copy maven wrapper and POM first for better layer caching
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline

# Copy source and build the application
COPY ./src ./src
RUN ./mvnw clean install -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-jammy
WORKDIR /opt/app

# Add metadata
LABEL maintainer="mekhrojmajidov@gmail.com"
LABEL version="1.0"
LABEL description="Web Project 2 (SpringBoot)"

# Create a non-root user to run the application
RUN addgroup --system --gid 1001 appuser && \
    adduser --system --uid 1001 --ingroup appuser appuser

# Configure application
ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE 8085

# Copy JAR from builder stage
COPY --from=builder /opt/app/target/*.jar /opt/app/app.jar

# Switch to non-root user
USER appuser

# Add health check
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:8085/actuator/health || exit 1

# DB Configuration
ENV DB_NAME=project2_db
ENV DB_PASS=1649
ENV DB_USER=postgres

# Start the application with JVM optimizations for containers
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-Djava.security.egd=file:/dev/./urandom", "-jar", "/opt/app/app.jar"]