FROM maven:3.9.9-eclipse-temurin-21 AS builder

WORKDIR /app

COPY pom.xml .

RUN mvn dependency:go-offline -B

COPY src ./src

RUN mvn clean package -DskipTests \
    -Dmaven.wagon.http.retryHandler.count=5 \
    -Dorg.slf4j.simpleLogger.defaultLogLevel=warn

FROM openjdk:21-jdk AS runner

WORKDIR /app

COPY --from=builder /app/target/api-gateway-0.0.1-SNAPSHOT.jar ./app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
FROM maven:3.9.9-eclipse-temurin-21 AS builder

WORKDIR /app

# Copy the entire project for the build
COPY pom.xml .
COPY src ./src

# Build the application with enhanced retry logic for transient network issues
RUN mvn clean package -DskipTests \
    -Dmaven.wagon.http.retryHandler.count=10 \
    -Dmaven.wagon.http.ssl.insecure=false \
    -Dmaven.wagon.httpconnectionmanager.ttlsecs=60 \
    -Dorg.slf4j.simpleLogger.defaultLogLevel=warn

FROM eclipse-temurin:21-jre-jammy AS runner

WORKDIR /app

COPY --from=builder /app/target/*.jar ./app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
