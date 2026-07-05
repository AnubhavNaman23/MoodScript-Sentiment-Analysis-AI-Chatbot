package com.moodscript.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.time.Duration;

/** Synchronous RestClients for the Flask ML service and the Ollama server. */
@Configuration
public class RestClientConfig {

    private SimpleClientHttpRequestFactory factory(int readSeconds) {
        SimpleClientHttpRequestFactory f = new SimpleClientHttpRequestFactory();
        f.setConnectTimeout(Duration.ofSeconds(5));
        f.setReadTimeout(Duration.ofSeconds(readSeconds));
        return f;
    }

    @Bean(name = "flaskClient")
    public RestClient flaskClient(AppProperties props) {
        return RestClient.builder()
                .baseUrl(props.flask().url())
                .requestFactory(factory(30))
                .build();
    }

    @Bean(name = "ollamaClient")
    public RestClient ollamaClient(AppProperties props) {
        return RestClient.builder()
                .baseUrl(props.ollama().url())
                .requestFactory(factory(60))
                .build();
    }
}
