import React from 'react';

// https://stackoverflow.com/questions/40418024/how-to-replace-n-to-linebreaks-in-react-js?rq=1
export default (string: string) =>
  string
    .split('\n')
    .map((item, index) => (index === 0 ? item : [<br key={index} />, item]));
