# Stage 1: Build the application
FROM maven:3.9.6-eclipse-temurin-21-jammy AS build
WORKDIR /app
COPY pom.xml .
# Download dependencies first to utilize Docker caching
RUN mvn dependency:go-offline
# Copy the source code and package the app
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
# Copy the built JAR file from the build stage
COPY --from=build /app/target/*.jar app.jar
# Render assigns a dynamic port, but we expose 8080 as a fallback
EXPOSE 8080
# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]