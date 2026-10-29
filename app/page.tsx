'use client';

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User, FileText, CheckCircle, Send, GraduationCap } from 'lucide-react';

// Supabase Client Connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function LsaiOnlineEnrollmentSystem() {
  const [formData, setFormData] = useState({
    lrn: '',
    firstName: '',
    lastName: '',
    middleName: '',
    gradeLevel: 'Nursery',
    strand: '',
    parentName: '',
    parentContact: '',
    parentEmail: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Insert Learner Record
      const { data: learner, error: learnerError } = await supabase
        .from('learners')
        .insert([
          {
            lrn: formData.lrn,
            first_name: formData.firstName,
            last_name: formData.lastName,
            middle_name: formData.middleName,
          },
        ])
        .select()
        .single();

      if (learnerError && learnerError.code !== '23505') throw learnerError;

      // 2. Insert Parent/Guardian Record
      const { data: parent, error: parentError } = await supabase
        .from('parent_guardians')
        .insert([
          {
            full_name: formData.parentName,
            contact_number: formData.parentContact,
            email: formData.parentEmail,
          },
        ])
        .select()
        .single();

      if (parentError) throw parentError;

      // 3. Insert Application Record
      const fullGradeStr =
        formData.gradeLevel.includes('Grade 11') || formData.gradeLevel.includes('Grade 12')
          ? `${formData.gradeLevel} - ${formData.strand}`
          : formData.gradeLevel;

      const { error: appError } = await supabase.from('applications').insert([
        {
          learner_id: learner?.id,
          parent_id: parent?.id,
          grade_level: fullGradeStr,
          status: 'pending',
          school_year: '2027-2028',
        },
      ]);

      if (appError) throw appError;

      setIsSubmitted(true);
    } catch (err: any) {
      console.error('Submission Error:', err);
      alert('There was an issue submitting your application: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Application Submitted!</h2>
          <p className="text-slate-600 mb-6">
            Thank you for enrolling at La Salette of Aurora, Inc. Your application for **School Year 2027–2028** has been successfully received.
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Submit Another Application
          </button>
        </div>
      </div>
    );
  }

  const isSHS = formData.gradeLevel.includes('Grade 11') || formData.gradeLevel.includes('Grade 12');

  return (
    <main className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-blue-900 text-white p-6 text-center">
          <h1 className="text-2xl font-bold tracking-wide">La Salette of Aurora, Inc.</h1>
          <p className="text-blue-200 text-sm mt-1 font-medium">
            Online Student Enrollment Portal — School Year 2027–2028
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          {/* Section 1: Learner Details */}
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2 border-b pb-2">
              <User className="w-5 h-5 text-blue-600" /> Learner Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Learner Reference Number (LRN)
                </label>
                <input
                  type="text"
                  name="lrn"
                  maxLength={12}
                  value={formData.lrn}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="12-digit LRN (Optional for Nursery/Kinder)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Grade Level to Enroll
                </label>
                <select
                  name="gradeLevel"
                  value={formData.gradeLevel}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <optgroup label="Early Childhood Education">
                    <option value="Nursery">Nursery</option>
                    <option value="Kindergarten">Kindergarten</option>
                  </optgroup>
                  <optgroup label="Elementary">
                    <option value="Grade 1">Grade 1</option>
                    <option value="Grade 2">Grade 2</option>
                    <option value="Grade 3">Grade 3</option>
                    <option value="Grade 4">Grade 4</option>
                    <option value="Grade 5">Grade 5</option>
                    <option value="Grade 6">Grade 6</option>
                  </optgroup>
                  <optgroup label="Junior High School">
                    <option value="Grade 7">Grade 7</option>
                    <option value="Grade 8">Grade 8</option>
                    <option value="Grade 9">Grade 9</option>
                    <option value="Grade 10">Grade 10</option>
                  </optgroup>
                  <optgroup label="Senior High School">
                    <option value="Grade 11 (SHS)">Grade 11 (SHS)</option>
                    <option value="Grade 12 (SHS)">Grade 12 (SHS)</option>
                  </optgroup>
                </select>
              </div>

              {/* Senior High Strand Selector */}
              {isSHS && (
                <div className="md:col-span-2 bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <label className="block text-sm font-semibold text-blue-900 mb-1 flex items-center gap-1">
                    <GraduationCap className="w-4 h-4 text-blue-700" /> Select Senior High Track / Strand
                  </label>
                  <select
                    name="strand"
                    required={isSHS}
                    value={formData.strand}
                    onChange={handleChange}
                    className="w-full border rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="">-- Choose Strand --</option>
                    <option value="STEM (Science, Technology, Engineering, and Mathematics)">
                      STEM (Science, Technology, Engineering, and Math)
                    </option>
                    <option value="ABM (Accountancy, Business, and Management)">
                      ABM (Accountancy, Business, and Management)
                    </option>
                    <option value="HUMSS (Humanities and Social Sciences)">
                      HUMSS (Humanities and Social Sciences)
                    </option>
                    <option value="GAS (General Academic Strand)">
                      GAS (General Academic Strand)
                    </option>
                    <option value="TVL (Technical-Vocational-Livelihood)">
                      TVL (Technical-Vocational-Livelihood Track)
                    </option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Middle Name (Optional)
                </label>
                <input
                  type="text"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Parent / Guardian Info */}
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2 border-b pb-2">
              <FileText className="w-5 h-5 text-blue-600" /> Parent / Guardian Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Parent / Guardian Full Name
                </label>
                <input
                  type="text"
                  name="parentName"
                  required
                  value={formData.parentName}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Contact Number
                </label>
                <input
                  type="tel"
                  name="parentContact"
                  required
                  value={formData.parentContact}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="09123456789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="parentEmail"
                  required
                  value={formData.parentEmail}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="parent@example.com"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {isSubmitting ? (
              'Submitting Application...'
            ) : (
              <>
                <Send className="w-4 h-4" /> Submit Enrollment Form
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}