import React, { useState, useEffect } from 'react';
import odishaDistricts from '../utils/odishaDistricts';
import { School, User, MapPin, GraduationCap, Users, Building, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

import { getAllSchools, getSchoolGrades } from '../services/school.service';

export default function CompleteProfile({ userType = '', onComplete }) {
  const [form, setForm] = useState({
    name: '',
    userType: userType || '',
    schoolId: '',
    district: '',
    place: '',
    class: '',
    subject: '',
    gradeId: '', // For student registration
  });
  const [error, setError] = useState('');
  const [schools, setSchools] = useState([]);
  const [grades, setGrades] = useState([]); // For student registration
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (form.userType === 'staff' || form.userType === 'student') {
      getAllSchools().then(setSchools);
    }
  }, [form.userType]);

  // Fetch grades when a school is selected and userType is student
  useEffect(() => {
    if (form.userType === 'student' && form.schoolId) {
      getSchoolGrades(form.schoolId).then(setGrades);
    } else {
      setGrades([]);
    }
  }, [form.userType, form.schoolId]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError(''); // Clear error on input change
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    if (!form.name || !form.userType) {
      setError('Please fill all required fields.');
      setLoading(false);
      return;
    }

    // Always add schoolId to user role data if present
    let formData = { ...form };
    if (form.userType === 'school') {
      if (!form.name || !form.district || !form.place) {
        setError('Please fill all school details.');
        setLoading(false);
        return;
      }
      formData.schoolAddress = `${form.place}, ${form.district}`;
    }

    if (form.userType === 'staff') {
      if (!form.schoolId) {
        setError('Please select a school.');
        setLoading(false);
        return;
      }
      formData.schoolId = form.schoolId;
    }

    if (form.userType === 'student') {
      if (!form.schoolId) {
        setError('Please select a school.');
        setLoading(false);
        return;
      }
      if (!form.gradeId) {
        setError('Please select a grade.');
        setLoading(false);
        return;
      }
      formData.schoolId = form.schoolId;
    }

    setError('');

    // Simulate API call
    setTimeout(() => {
      onComplete(formData);
      setLoading(false);
    }, 1000);
  }

  const getRoleConfig = () => {
    switch (form.userType) {
      case 'school':
        return {
          icon: School,
          title: 'School Registration',
          subtitle: 'Set up your school profile',
          gradient: 'from-orange-500 to-red-500',
          bgGradient: 'from-orange-50 to-red-50'
        };
      case 'staff':
        return {
          icon: Users,
          title: 'Teacher Registration',
          subtitle: 'Join your school as an educator',
          gradient: 'from-emerald-500 to-green-600',
          bgGradient: 'from-emerald-50 to-green-50'
        };
      case 'student':
        return {
          icon: GraduationCap,
          title: 'Student Registration',
          subtitle: 'Start your learning journey',
          gradient: 'from-blue-500 to-indigo-600',
          bgGradient: 'from-blue-50 to-indigo-50'
        };
      default:
        return {
          icon: User,
          title: 'Complete Profile',
          subtitle: 'Finish setting up your account',
          gradient: 'from-purple-500 to-pink-600',
          bgGradient: 'from-purple-50 to-pink-50'
        };
    }
  };

  const roleConfig = getRoleConfig();
  const IconComponent = roleConfig.icon;

  // Removed classes and subjects for student registration

  // School Registration Form
  if (form.userType === 'school') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.05)_1px,transparent_0)] bg-[size:20px_20px]"></div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-lg transform rotate-12">
          <Building className="w-5 h-5 text-white" />
        </div>
        
        <div className="relative z-10 w-full max-w-lg max-h-screen overflow-y-auto p-2 sm:p-4 md:p-6 lg:p-8 rounded-3xl">
          {/* Header Card */}
          <div className={`bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 mb-6 relative overflow-hidden`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${roleConfig.bgGradient} opacity-30`}></div>
            <div className="relative z-10 text-center">
              <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r ${roleConfig.gradient} rounded-2xl mb-4 shadow-lg`}>
                <IconComponent className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{roleConfig.title}</h2>
              <p className="text-gray-600">{roleConfig.subtitle}</p>
            </div>
          </div>

          {/* Form Card */}
          <form className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8" onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <School className="w-4 h-4 mr-2" />
                  School Name
                </label>
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your school name"
                  className="w-full px-4 py-4 bg-white/80 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <MapPin className="w-4 h-4 mr-2" />
                  District
                </label>
                <select
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-4 bg-white/80 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-sm"
                >
                  <option value="">Select district</option>
                  {odishaDistricts.map(d => (
                    <option key={d.district} value={d.district}>{d.district}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <MapPin className="w-4 h-4 mr-2" />
                  City / Village
                </label>
                <select
                  name="place"
                  value={form.place}
                  onChange={handleChange}
                  required
                  disabled={!form.district}
                  className="w-full px-4 py-4 bg-white/80 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-sm"
                >
                  <option value="">Select city or village</option>
                  {form.district && odishaDistricts.find(d => d.district === form.district)?.places.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="flex items-center p-4 bg-red-50/80 border border-red-200 rounded-2xl text-red-600">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-gradient-to-r ${roleConfig.gradient} text-white py-4 px-6 rounded-2xl font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-center justify-center space-x-2">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Setting up school...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Complete School Registration</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Staff Registration Form
  if (form.userType === 'staff') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.05)_1px,transparent_0)] bg-[size:20px_20px]"></div>
        </div>
        <div className="absolute top-20 left-20 p-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl shadow-lg transform -rotate-12">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div className="relative z-10 w-full max-w-lg">
          {/* Header Card */}
          <div className={`bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 mb-6 relative overflow-hidden`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${roleConfig.bgGradient} opacity-30`}></div>
            <div className="relative z-10 text-center">
              <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r ${roleConfig.gradient} rounded-2xl mb-4 shadow-lg`}>
                <IconComponent className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{roleConfig.title}</h2>
              <p className="text-gray-600">{roleConfig.subtitle}</p>
            </div>
          </div>
          {/* Staff Form Card */}
          <form className="bg-white/70 backdrop-blur-xl shadow-xl border border-white/20 p-6 sm:p-8 rounded-3xl" onSubmit={handleSubmit} style={{ maxHeight: '80vh', overflowY: 'auto' }}>
            <div className="space-y-6">
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <School className="w-4 h-4 mr-2" />
                  Select School
                </label>
                <select
                  name="schoolId"
                  value={form.schoolId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-4 bg-white/80 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
                >
                  <option value="">Select your school</option>
                  {schools.map(school => (
                    <option key={school.id} value={school.id}>{school.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <User className="w-4 h-4 mr-2" />
                  Your Name
                </label>
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your name"
                  className="w-full px-4 py-4 bg-white/80 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
                />
              </div>
              {error && (
                <div className="flex items-center p-4 bg-red-50/80 border border-red-200 rounded-2xl text-red-600">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span className="font-medium">{error}</span>
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-gradient-to-r ${roleConfig.gradient} text-white py-4 px-6 rounded-2xl font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-center justify-center space-x-2">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Registering...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Complete Teacher Registration</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }


  // Student Registration Form
  if (form.userType === 'student') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.05)_1px,transparent_0)] bg-[size:20px_20px]"></div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg transform rotate-12">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="relative z-10 w-full max-w-lg max-h-screen overflow-y-auto p-2 sm:p-4 md:p-6 lg:p-8 rounded-3xl">
          {/* Header Card */}
          <div className={`bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 mb-6 relative overflow-hidden`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${roleConfig.bgGradient} opacity-30`}></div>
            <div className="relative z-10 text-center">
              <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r ${roleConfig.gradient} rounded-2xl mb-4 shadow-lg`}>
                <IconComponent className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{roleConfig.title}</h2>
              <p className="text-gray-600">{roleConfig.subtitle}</p>
            </div>
          </div>
          {/* Form Card */}
          <form className="bg-white/70 backdrop-blur-xl shadow-xl border border-white/20 p-6 sm:p-8 rounded-3xl" onSubmit={handleSubmit} style={{ maxHeight: '80vh', overflowY: 'auto' }}>
            <div className="space-y-6">
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <School className="w-4 h-4 mr-2" />
                  Select School
                </label>
                <select
                  name="schoolId"
                  value={form.schoolId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-4 bg-white/80 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                >
                  <option value="">Select your school</option>
                  {schools.map(school => (
                    <option key={school.id} value={school.id}>{school.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Select Grade
                </label>
                <select
                  name="gradeId"
                  value={form.gradeId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-4 bg-white/80 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
                  disabled={!form.schoolId || grades.length === 0}
                >
                  <option value="">Select your grade</option>
                  {grades.map(grade => (
                    <option key={grade.id} value={grade.id}>{grade.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <User className="w-4 h-4 mr-2" />
                  Your Name
                </label>
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your name"
                  className="w-full px-4 py-4 bg-white/80 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                />
              </div>
              {error && (
                <div className="flex items-center p-4 bg-red-50/80 border border-red-200 rounded-2xl text-red-600">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span className="font-medium">{error}</span>
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-gradient-to-r ${roleConfig.gradient} text-white py-4 px-6 rounded-2xl font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-center justify-center space-x-2">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Complete Registration</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }


  // Student Registration Form
  if (form.userType === 'student') {
    return (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.05)_1px,transparent_0)] bg-[size:20px_20px]"></div>
        </div>
        
        <div className="absolute top-32 right-16 p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg transform rotate-6">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        
  <div className="relative z-10 w-full max-w-lg max-h-screen overflow-y-auto p-2 sm:p-4 md:p-6 lg:p-8 rounded-3xl">
          {/* Header Card */}
          <div className={`bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 mb-6 relative overflow-hidden`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${roleConfig.bgGradient} opacity-30`}></div>
            <div className="relative z-10 text-center">
              <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r ${roleConfig.gradient} rounded-2xl mb-4 shadow-lg`}>
                <IconComponent className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{roleConfig.title}</h2>
              <p className="text-gray-600">{roleConfig.subtitle}</p>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white/70 backdrop-blur-xl shadow-xl border border-white/20 p-6 sm:p-8 rounded-3xl" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
            <div className="space-y-6">
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <School className="w-4 h-4 mr-2" />
                  Select School
                </label>
                <select
                  name="schoolId"
                  value={form.schoolId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-4 bg-white/80 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                >
                  <option value="">Select your school</option>
                  {schools.map(school => (
                    <option key={school.id} value={school.id}>{school.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <User className="w-4 h-4 mr-2" />
                  Your Name
                </label>
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your name"
                  className="w-full px-4 py-4 bg-white/80 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                />
              </div>
              {error && (
                <div className="flex items-center p-4 bg-red-50/80 border border-red-200 rounded-2xl text-red-600">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span className="font-medium">{error}</span>
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-gradient-to-r ${roleConfig.gradient} text-white py-4 px-6 rounded-2xl font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-center justify-center space-x-2">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Complete Registration</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}