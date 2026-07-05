package com.moodscript;

import com.moodscript.config.AppProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(AppProperties.class)
public class MoodscriptApplication {
    public static void main(String[] args) {
        SpringApplication.run(MoodscriptApplication.class, args);
    }
}
