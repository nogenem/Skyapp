package com.nogenem.skyapp.unit.Utils;

import static org.assertj.core.api.Assertions.assertThat;

import com.nogenem.skyapp.utils.Utils;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;

public class GetOriginFromHeadersTest {

  @Test
  @DisplayName("should return the host when passed `x-forwarded-proto` and `x-forwarded-host` headers")
  public void shouldReturnHostFromForwardedHeaders() throws Exception {
    HttpHeaders headers = new HttpHeaders();
    headers.set("x-forwarded-proto", "http");
    headers.set("x-forwarded-host", "www.test.com");

    String host = Utils.getOriginFromHeaders(headers);

    assertThat(host).isEqualTo("http://www.test.com");
  }

  @Test
  @DisplayName("should return the host when passed `referer` header")
  public void shouldReturnHostFromRefererHeader() throws Exception {
    HttpHeaders headers = new HttpHeaders();
    headers.set("referer", "http://www.test.com/test");

    String host = Utils.getOriginFromHeaders(headers);

    assertThat(host).isEqualTo("http://www.test.com");
  }

  @Test
  @DisplayName("should return the `host` header with `http` at the start")
  public void shouldReturnHostHeaderWithHttpAtStart() throws Exception {
    HttpHeaders headers = new HttpHeaders();
    headers.set("host", "www.test.com");

    String host = Utils.getOriginFromHeaders(headers);

    assertThat(host).isEqualTo("http://www.test.com");
  }

  @Test
  @DisplayName("should return the `host` header with `https` at the start")
  public void shouldReturnHostHeaderWithHttpsAtStart() throws Exception {
    HttpHeaders headers = new HttpHeaders();
    headers.set("host", "https://www.test.com");

    String host = Utils.getOriginFromHeaders(headers);

    assertThat(host).isEqualTo("https://www.test.com");
  }


}
