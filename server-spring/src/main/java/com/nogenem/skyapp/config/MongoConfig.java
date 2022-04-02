package com.nogenem.skyapp.config;

import java.util.List;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.nogenem.skyapp.utils.Utils;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
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
  public boolean autoIndexCreation() {
    return true;
  }

  @Override
  protected void configureConverters(MongoConverterConfigurationAdapter adapter) {
    List<Converter<?, ?>> converters = Utils.getMongoConvertersList();
    adapter.registerConverters(converters);
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
