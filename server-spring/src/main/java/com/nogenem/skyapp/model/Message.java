package com.nogenem.skyapp.model;

import java.time.Instant;
import java.util.LinkedHashMap;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.mongodb.lang.NonNull;
import com.nogenem.skyapp.enums.MessageType;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// https://stackoverflow.com/questions/48010606/using-objectid-as-string-in-java-manual-reference-with-spring-data-mongodb
// https://stackoverflow.com/questions/64163644/spring-mongodb-manual-reference

@Document(collection = "messages")
@JsonPropertyOrder(value = { "_id" })
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Message {

  @Id
  @JsonProperty("_id")
  private String id;

  @NonNull
  @Field(targetType = FieldType.OBJECT_ID)
  private String channelId;

  @NonNull
  @Field(targetType = FieldType.OBJECT_ID)
  private String fromId;

  @NonNull
  private Object body;

  @Field(targetType = FieldType.INT32)
  private MessageType type;

  @CreatedDate
  private Instant createdAt;

  @LastModifiedDate
  private Instant updatedAt;

  public Object getBody() {
    this.updateBodyValueIfNeeded();
    return this.body;
  }

  private void updateBodyValueIfNeeded() {
    // Database loads a LinkedHashMap, since i'm using Object ;/
    if (this.body.getClass() == LinkedHashMap.class) {
      @SuppressWarnings("unchecked")
      LinkedHashMap<String, Object> tmpHashMap = (LinkedHashMap<String, Object>) this.body;

      Attachment attachment = new Attachment();
      attachment.setOriginalName((String) tmpHashMap.get("originalName"));
      attachment.setMimeType((String) tmpHashMap.get("mimeType"));
      attachment.setSize((long) tmpHashMap.get("size"));
      attachment.setPath((String) tmpHashMap.get("path"));

      if (tmpHashMap.containsKey("imageDimensions")) {
        @SuppressWarnings("unchecked")
        LinkedHashMap<String, Object> tmpDimentions = (LinkedHashMap<String, Object>) tmpHashMap.get("imageDimensions");

        Attachment.ImageDimensions dim = attachment.new ImageDimensions();
        dim.setWidth((int) tmpDimentions.get("width"));
        dim.setHeight((int) tmpDimentions.get("height"));

        attachment.setImageDimensions(dim);
      }

      this.body = attachment;
    }
  }

}
