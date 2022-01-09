package com.nogenem.skyapp.utils;

import java.util.List;
import java.util.Locale;

import com.transferwise.icu.ICUMessageSource;

import freemarker.template.TemplateMethodModelEx;
import freemarker.template.TemplateModelException;
import lombok.AllArgsConstructor;

@AllArgsConstructor
public class TranslateResolverMethod implements TemplateMethodModelEx {

  private ICUMessageSource messageSource;
  private Locale locale;

  @SuppressWarnings("rawtypes")
  @Override
  public Object exec(List arguments) throws TemplateModelException {
    if (arguments.size() < 1) {
      throw new TemplateModelException("`t` needs at least 1 argument");
    }

    String code = arguments.get(0).toString();
    if (code == null || code.isEmpty()) {
      throw new TemplateModelException("Invalid code value '" + code + "'");
    }

    Object[] args = null;
    if (arguments.size() > 1) {
      args = arguments.subList(1, arguments.size()).toArray();
    }

    return this.messageSource.getMessage(code, args, locale);
  }

}
