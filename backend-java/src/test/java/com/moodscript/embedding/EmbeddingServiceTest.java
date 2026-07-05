package com.moodscript.embedding;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class EmbeddingServiceTest {

    @Test
    void cosineOfIdenticalVectorsIsOne() {
        float[] v = {0.1f, 0.2f, 0.3f, 0.4f};
        assertThat(EmbeddingService.cosine(v, v)).isCloseTo(1.0, org.assertj.core.data.Offset.offset(1e-6));
    }

    @Test
    void cosineOfOrthogonalVectorsIsZero() {
        float[] a = {1f, 0f};
        float[] b = {0f, 1f};
        assertThat(EmbeddingService.cosine(a, b)).isEqualTo(0.0);
    }

    @Test
    void cosineHandlesZeroVectorSafely() {
        float[] a = {0f, 0f};
        float[] b = {1f, 1f};
        assertThat(EmbeddingService.cosine(a, b)).isEqualTo(0.0);
    }
}
