import TmpFile from './TmpFile';

class TmpImage extends TmpFile {
  protected _src: string;

  constructor(file: File) {
    super(file);

    this._src = '';
  }

  src() {
    if (!this._src) {
      this._src = URL.createObjectURL(this._file);
    }
    return this._src;
  }

  revokeSrc() {
    if (this._src) {
      URL.revokeObjectURL(this._src);
    }
  }
}

export default TmpImage;
