import React, { useEffect, useState, useRef } from 'react';
import { ImageIcon, Video, Play, X, Save, Film, Star, Calendar, File, Upload, ArrowLeft, Crown } from 'lucide-react';

// ─── FileUploadBox ────────────────────────────────────────────────────────────
const FileUploadBox = ({ fileType, file, preview, error, accept, title, icon: Icon, onFileChange, onRemove, inputRef, currentUrl }) => (
  <div
    className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer
      ${error ? 'border-red-500 bg-red-500/5' : 'border-gray-700 hover:border-blue-500 hover:bg-blue-500/5'}`}
    onClick={() => inputRef?.current?.click()}
  >
    <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(e) => onFileChange(e, fileType)} />
    {preview ? (
      <div className="relative">
        {fileType === 'poster'
          ? <img src={preview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
          : <video src={preview} className="w-full h-40 object-cover rounded-lg" controls />}
        <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(fileType); }}
          className="absolute top-1 right-1 bg-red-600 rounded-full p-1 hover:bg-red-700">
          <X className="w-3 h-3" />
        </button>
        <p className="text-xs text-gray-400 mt-2 truncate">{file?.name}</p>
      </div>
    ) : currentUrl ? (
      <div>
        <p className="text-xs text-gray-500 mb-2">File hiện tại:</p>
        {fileType === 'poster'
          ? <img src={`http://localhost:5000${currentUrl}`} alt="Current" className="w-full h-40 object-cover rounded-lg opacity-60" />
          : <div className="w-full h-40 bg-gray-800 rounded-lg flex items-center justify-center">
              <Icon className="w-10 h-10 text-gray-600" />
            </div>}
        <p className="text-xs text-blue-400 mt-2">Nhấn để thay file mới</p>
      </div>
    ) : (
      <div className="py-4">
        <Icon className="w-10 h-10 text-gray-600 mx-auto mb-2" />
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-xs text-gray-600 mt-1">Kéo thả hoặc nhấn để chọn</p>
      </div>
    )}
    {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
  </div>
);

// ─── EditMovieComponent ───────────────────────────────────────────────────────
const EditMovieComponent = ({ movieId, onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '', description: '', releaseDate: '', genre: '',
    categories: [], isVip: false,
    posterFile: null, videoFile: null, trailerFile: null,
    posterPreview: '', videoPreview: '', trailerPreview: '',
    currentPosterUrl: '', currentVideoUrl: '', currentTrailerUrl: ''
  });
  const [errors, setErrors]           = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading]       = useState(true);
  const [showSuccess, setShowSuccess]   = useState(false);
  const [availableCategories, setAvailableCategories] = useState([]);

  const posterInputRef  = useRef(null);
  const videoInputRef   = useRef(null);
  const trailerInputRef = useRef(null);

  // Tải danh sách thể loại
  useEffect(() => {
    fetch('http://localhost:5000/api/categories')
      .then(res => res.json())
      .then(data => setAvailableCategories(Array.isArray(data) ? data : data.categories || []))
      .catch(err => console.error('Lỗi tải thể loại:', err));
  }, []);

  // Tải dữ liệu phim
  useEffect(() => { if (movieId) loadMovieData(); }, [movieId]);

  const loadMovieData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/movies/${movieId}`);
      if (!res.ok) throw new Error('Không thể tải thông tin phim');
      const d = await res.json();
      setFormData({
        title:             d.Title        || '',
        description:       d.Description  || '',
        releaseDate:       d.ReleaseDate  ? d.ReleaseDate.split('T')[0] : '',
        genre:             d.Genre        || '',
        categories:        d.categories   || [],
        isVip:             d.IsVip === 1,          // ← đọc IsVip từ DB
        posterFile: null, videoFile: null, trailerFile: null,
        posterPreview: '', videoPreview: '', trailerPreview: '',
        currentPosterUrl:  d.PosterURL  || '',
        currentVideoUrl:   d.VideoURL   || '',
        currentTrailerUrl: d.TrailerURL || ''
      });
    } catch (err) {
      setErrors({ load: 'Không thể tải thông tin phim. Vui lòng thử lại.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;
    const imgTypes   = ['image/jpeg','image/jpg','image/png','image/webp'];
    const videoTypes = ['video/mp4','video/avi','video/mkv','video/mov','video/wmv'];
    if (fileType === 'poster' && !imgTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, [fileType]: 'Chỉ chấp nhận JPG, PNG, WEBP' })); return;
    }
    if ((fileType === 'video' || fileType === 'trailer') && !videoTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, [fileType]: 'Chỉ chấp nhận MP4, AVI, MKV, MOV' })); return;
    }
    setErrors(prev => ({ ...prev, [fileType]: '' }));
    const previewURL = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, [`${fileType}File`]: file, [`${fileType}Preview`]: previewURL }));
  };

  const removeFile = (fileType) => {
    if (formData[`${fileType}Preview`]) URL.revokeObjectURL(formData[`${fileType}Preview`]);
    setFormData(prev => ({ ...prev, [`${fileType}File`]: null, [`${fileType}Preview`]: '' }));
    const refs = { poster: posterInputRef, video: videoInputRef, trailer: trailerInputRef };
    if (refs[fileType]?.current) refs[fileType].current.value = '';
  };

  const handleCategoryToggle = (cat) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat]
    }));
  };

  const validateForm = () => {
    const e = {};
    if (!formData.title.trim())       e.title       = 'Tên phim là bắt buộc';
    if (!formData.description.trim()) e.description = 'Mô tả phim là bắt buộc';
    if (!formData.releaseDate)        e.releaseDate = 'Ngày phát hành là bắt buộc';
    if (!formData.genre.trim())       e.genre       = 'Thể loại chính là bắt buộc';
    if (formData.categories.length === 0) e.categories = 'Vui lòng chọn ít nhất một thể loại';
    if (!formData.videoFile && !formData.currentVideoUrl) e.video = 'Vui lòng chọn file video chính';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    const form = new FormData();
    form.append('title',       formData.title);
    form.append('description', formData.description);
    form.append('releaseDate', formData.releaseDate);
    form.append('genre',       formData.genre);
    form.append('categories',  JSON.stringify(formData.categories));
    form.append('isVip',       formData.isVip ? '1' : '0');  // ← VIP flag
    if (formData.posterFile)  form.append('poster',  formData.posterFile);
    if (formData.videoFile)   form.append('video',   formData.videoFile);
    if (formData.trailerFile) form.append('trailer', formData.trailerFile);

    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/movies/${movieId}`, { method: 'PUT', body: form });
      if (!res.ok) throw new Error(await res.text());
      setShowSuccess(true);
      setTimeout(() => { setShowSuccess(false); onSuccess?.(); }, 1500);
    } catch (err) {
      setErrors(prev => ({ ...prev, submit: err.message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (errors.load) return (
    <div className="text-center py-10 text-red-400">{errors.load}</div>
  );

  return (
    <div className="text-white space-y-6">
      {showSuccess && (
        <div className="bg-green-600/20 border border-green-500/30 rounded-xl p-4 text-green-400 text-center font-medium">
          ✅ Phim đã được cập nhật thành công!
        </div>
      )}
      {errors.submit && (
        <div className="bg-red-600/20 border border-red-500/30 rounded-xl p-4 text-red-400 text-center">
          {errors.submit}
        </div>
      )}

      {/* ── Thông tin cơ bản ── */}
      <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Film className="w-5 h-5 text-blue-500" /> Thông Tin Cơ Bản
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Film className="w-4 h-4 text-blue-500" /> Tên Phim *
            </label>
            <input type="text" name="title" value={formData.title} onChange={handleInputChange}
              placeholder="Nhập tên phim..."
              className={`w-full px-4 py-3 bg-gray-900 border rounded-xl focus:outline-none focus:ring-2 transition-all
                ${errors.title ? 'border-red-500 focus:ring-red-500/30' : 'border-gray-700 focus:border-blue-500 focus:ring-blue-500/30'}`} />
            {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Star className="w-4 h-4 text-blue-500" /> Thể Loại Chính *
            </label>
            <input type="text" name="genre" value={formData.genre} onChange={handleInputChange}
              placeholder="Ví dụ: Hành động, Kinh dị..."
              className={`w-full px-4 py-3 bg-gray-900 border rounded-xl focus:outline-none focus:ring-2 transition-all
                ${errors.genre ? 'border-red-500 focus:ring-red-500/30' : 'border-gray-700 focus:border-blue-500 focus:ring-blue-500/30'}`} />
            {errors.genre && <p className="text-red-400 text-sm mt-1">{errors.genre}</p>}
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Calendar className="w-4 h-4 text-blue-500" /> Ngày Phát Hành *
            </label>
            <input type="date" name="releaseDate" value={formData.releaseDate} onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-gray-900 border rounded-xl focus:outline-none focus:ring-2 transition-all
                ${errors.releaseDate ? 'border-red-500 focus:ring-red-500/30' : 'border-gray-700 focus:border-blue-500 focus:ring-blue-500/30'}`} />
            {errors.releaseDate && <p className="text-red-400 text-sm mt-1">{errors.releaseDate}</p>}
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <File className="w-4 h-4 text-blue-500" /> Mô Tả Phim *
            </label>
            <textarea name="description" value={formData.description} onChange={handleInputChange}
              rows={4} placeholder="Nhập mô tả nội dung phim..."
              className={`w-full px-4 py-3 bg-gray-900 border rounded-xl focus:outline-none focus:ring-2 transition-all resize-none
                ${errors.description ? 'border-red-500 focus:ring-red-500/30' : 'border-gray-700 focus:border-blue-500 focus:ring-blue-500/30'}`} />
            {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
          </div>
        </div>

        {/* ── Toggle VIP ── */}
        <div className="mt-6">
          <label className="flex items-center gap-3 cursor-pointer select-none w-fit">
            <div className="relative">
              <input type="checkbox" name="isVip" checked={formData.isVip} onChange={handleInputChange} className="sr-only" />
              <div className={`w-12 h-6 rounded-full transition-colors ${formData.isVip ? 'bg-yellow-500' : 'bg-gray-700'}`} />
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${formData.isVip ? 'translate-x-6' : ''}`} />
            </div>
            <span className={`flex items-center gap-2 font-medium ${formData.isVip ? 'text-yellow-400' : 'text-gray-400'}`}>
              <Crown className="w-4 h-4" />
              {formData.isVip ? 'Phim VIP – Chỉ thành viên VIP mới xem được' : 'Phim thường – Người đã đăng nhập xem được'}
            </span>
          </label>
          {formData.isVip && (
            <p className="text-yellow-500/70 text-xs mt-2 ml-1">
              ⚠ Người chưa đăng nhập và tài khoản thường chỉ xem được trailer.
            </p>
          )}
        </div>
      </div>

      {/* ── Upload media ── */}
      <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Upload className="w-5 h-5 text-blue-500" /> Cập Nhật File Media
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium mb-3">Ảnh Bìa Phim</label>
            <FileUploadBox fileType="poster" file={formData.posterFile} preview={formData.posterPreview}
              error={errors.poster} accept="image/*" title="Chọn Ảnh Bìa Mới" icon={ImageIcon}
              onFileChange={handleFileChange} onRemove={removeFile} inputRef={posterInputRef}
              currentUrl={formData.currentPosterUrl} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-3">Video Phim Chính *</label>
            <FileUploadBox fileType="video" file={formData.videoFile} preview={formData.videoPreview}
              error={errors.video} accept="video/*" title="Chọn Video Chính Mới" icon={Video}
              onFileChange={handleFileChange} onRemove={removeFile} inputRef={videoInputRef}
              currentUrl={formData.currentVideoUrl} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-3">Video Trailer</label>
            <FileUploadBox fileType="trailer" file={formData.trailerFile} preview={formData.trailerPreview}
              error={errors.trailer} accept="video/*" title="Chọn Trailer Mới" icon={Play}
              onFileChange={handleFileChange} onRemove={removeFile} inputRef={trailerInputRef}
              currentUrl={formData.currentTrailerUrl} />
          </div>
        </div>
      </div>

      {/* ── Thể loại ── */}
      <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Star className="w-5 h-5 text-blue-500" /> Thể Loại Phim *
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-4">
          {availableCategories.map(cat => (
            <label key={cat} className="flex items-center gap-2 p-3 hover:bg-gray-800 rounded-lg cursor-pointer border border-gray-700 hover:border-gray-600">
              <input type="checkbox" checked={formData.categories.includes(cat)} onChange={() => handleCategoryToggle(cat)}
                className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500" />
              <span className="text-sm">{cat}</span>
            </label>
          ))}
        </div>
        {errors.categories && <p className="text-red-400 text-sm mb-3">{errors.categories}</p>}
        {formData.categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.categories.map(cat => (
              <span key={cat} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm">
                {cat}
                <button type="button" onClick={() => handleCategoryToggle(cat)}><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Nút ── */}
      <div className="flex gap-4 pt-2">
        {onBack && (
          <button type="button" onClick={onBack}
            className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-colors flex items-center gap-2 font-medium">
            <ArrowLeft className="w-4 h-4" /> Quay Lại
          </button>
        )}
        <button type="button" onClick={handleSubmit} disabled={isSubmitting}
          className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800
            disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl transition-all flex items-center justify-center gap-2 font-medium">
          {isSubmitting
            ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang Cập Nhật...</>
            : <><Save className="w-5 h-5" /> Lưu Thay Đổi</>}
        </button>
      </div>
    </div>
  );
};

export default EditMovieComponent;
