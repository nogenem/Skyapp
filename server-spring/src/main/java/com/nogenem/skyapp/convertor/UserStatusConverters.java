package com.nogenem.skyapp.convertor;

import com.nogenem.skyapp.enums.UserStatus;

import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;
import org.springframework.data.convert.WritingConverter;

public class UserStatusConverters {
  @ReadingConverter
  public static class UserStatusReadingConverter implements Converter<Integer, UserStatus> {
    @Override
    public UserStatus convert(final Integer source) {
      return UserStatus.fromInt(source);
    }
  }

  @WritingConverter
  public static class UserStatusWritingConverter implements Converter<UserStatus, Integer> {
    @Override
    public Integer convert(final UserStatus source) {
      return source.getValue();
    }
  }
}
