package com.nogenem.skyapp.utils;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

import com.nogenem.skyapp.convertor.MessageTypeConverters;
import com.nogenem.skyapp.convertor.UserStatusConverters;

import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpHeaders;
import org.springframework.util.StringUtils;

public final class Utils {

  public static String getOriginFromHeaders(HttpHeaders headers) throws MalformedURLException {
    if (headers.containsKey("x-forwarded-host")) {
      String origin = String.format("%s://%s", headers.get("x-forwarded-proto").get(0),
          headers.get("x-forwarded-host").get(0));
      return StringUtils.trimTrailingCharacter(origin, '/');
    }

    if (headers.containsKey("referer")) {
      URL url = new URL(headers.get("referer").get(0));
      String origin = String.format("%s://%s", url.getProtocol(), url.getHost());

      if (url.getPort() > 0) {
        origin = String.format("%s:%d", origin, url.getPort());
      }

      return StringUtils.trimTrailingCharacter(origin, '/');
    }

    if (headers.containsKey("host")) {
      String origin = headers.get("host").get(0);

      if (!origin.startsWith("http")) {
        origin = "http://" + origin;
      }

      return origin;
    }

    return null;
  }

  public static List<Converter<?, ?>> getMongoConvertersList() {
    List<Converter<?, ?>> converters = new ArrayList<>();
    converters.add(new UserStatusConverters.UserStatusWritingConverter());
    converters.add(new UserStatusConverters.UserStatusReadingConverter());
    converters.add(new MessageTypeConverters.MessageTypeWritingConverter());
    converters.add(new MessageTypeConverters.MessageTypeReadingConverter());
    return converters;
  }
}
