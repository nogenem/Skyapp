package com.nogenem.skyapp.convertor;

import com.nogenem.skyapp.enums.MessageType;

import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;
import org.springframework.data.convert.WritingConverter;

// https://stackoverflow.com/questions/56151780/spring-jparepository-enum-mismatch
// https://www.mongodb.com/community/forums/t/cannot-store-java-enum-values-in-mongodb/99719
// https://www.baeldung.com/spring-enum-request-param
// https://stackoverflow.com/questions/51002021/spring-mongodb-no-enum-constant-error
// http://ufasoli.blogspot.com/2017/06/custom-converter-for-mongodb-and-spring.html

public class MessageTypeConverters {
  @ReadingConverter
  public static class MessageTypeReadingConverter implements Converter<Integer, MessageType> {
    @Override
    public MessageType convert(final Integer source) {
      return MessageType.fromInt(source);
    }
  }

  @WritingConverter
  public static class MessageTypeWritingConverter implements Converter<MessageType, Integer> {
    @Override
    public Integer convert(final MessageType source) {
      return source.getValue();
    }
  }
}
