package com.credx.campus.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

@Configuration
@Profile("!test")
public class DataSourceConfig {

    @Bean
    @Primary
    @ConfigurationProperties("spring.datasource.hikari")
    public DataSource dataSource(
        DataSourceProperties properties,
        @Value("${DB_HOST:localhost}") String host,
        @Value("${DB_PORT:3306}") String port,
        @Value("${DB_NAME:campus_portal}") String dbName
    ) throws Exception {
        String bootstrapUrl = String.format(
            "jdbc:mysql://%s:%s/?sslMode=VERIFY_IDENTITY&useSSL=true&allowPublicKeyRetrieval=true",
            host, port
        );
        try (Connection conn = DriverManager.getConnection(bootstrapUrl, properties.getUsername(), properties.getPassword());
             Statement st = conn.createStatement()) {
            st.executeUpdate("CREATE DATABASE IF NOT EXISTS `" + dbName + "`");
        }

        HikariDataSource ds = properties.initializeDataSourceBuilder()
            .type(HikariDataSource.class)
            .build();
        ds.setJdbcUrl(String.format(
            "jdbc:mysql://%s:%s/%s?sslMode=VERIFY_IDENTITY&useSSL=true&allowPublicKeyRetrieval=true",
            host, port, dbName
        ));
        return ds;
    }
}
