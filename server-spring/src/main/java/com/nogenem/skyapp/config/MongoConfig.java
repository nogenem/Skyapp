package com.nogenem.skyapp.config;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.nogenem.skyapp.convertor.MessageTypeConverters;
import com.nogenem.skyapp.convertor.UserStatusConverters;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;
import org.springframework.data.mongodb.core.convert.DbRefResolver;
import org.springframework.data.mongodb.core.convert.DefaultDbRefResolver;
import org.springframework.data.mongodb.core.convert.DefaultMongoTypeMapper;
import org.springframework.data.mongodb.core.convert.MappingMongoConverter;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions.MongoConverterConfigurationAdapter;
import org.springframework.data.mongodb.core.mapping.MongoMappingContext;

@Configuration
public class MongoConfig extends AbstractMongoClientConfiguration {

  @Value("${env.MONGO_DBNAME}")
  private String dbName;
  @Value("${spring.data.mongodb.uri}")
  private String dbUri;

  @Override
  protected String getDatabaseName() {
    return this.dbName;
  }

  @Bean
  public MongoClient mongoClient() {
    return MongoClients.create(this.dbUri);
  }

  @Override
  protected void configureConverters(MongoConverterConfigurationAdapter adapter) {
    adapter.registerConverter(new UserStatusConverters.UserStatusWritingConverter());
    adapter.registerConverter(new UserStatusConverters.UserStatusReadingConverter());
    adapter.registerConverter(new MessageTypeConverters.MessageTypeWritingConverter());
    adapter.registerConverter(new MessageTypeConverters.MessageTypeReadingConverter());
  }

  // remove _class
  // https://stackoverflow.com/questions/23517977/spring-boot-mongodb-how-to-remove-the-class-column/48546964
  @Bean
  public MappingMongoConverter mappingMongoConverter(MongoDatabaseFactory databaseFactory,
      MongoCustomConversions customConversions, MongoMappingContext mappingContext) {

    DbRefResolver dbRefResolver = new DefaultDbRefResolver(databaseFactory);
    MappingMongoConverter converter = new MappingMongoConverter(dbRefResolver, mappingContext);
    converter.setCustomConversions(customConversions);
    converter.setCodecRegistryProvider(databaseFactory);
    converter.setTypeMapper(new DefaultMongoTypeMapper(null));

    return converter;
  }

}
