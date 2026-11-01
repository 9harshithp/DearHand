import React, { useState } from 'react';
import { apiRequest } from '../api/client';
import {
  Star,
  CheckCircle2,
  AlertCircle,
  X,
  HeartHandshake
} from 'lucide-react';

export default function ReviewModal({ bookingId, helperName, onClose, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      const updated = await apiRequest(`/bookings/${bookingId}/review`, {
        method: 'POST',
        body: JSON.stringify({
          rating,
          comment: comment.trim(),
        }),
      });
      onSuccess(updated);
    } catch (err) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white max-w-lg w-full rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl my-8 border-2 border-slate-200">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center">
              <Star className="w-6 h-6 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">
                Rate Your Helper
              </h3>
              <p className="text-sm font-semibold text-slate-500">
                Feedback for {helperName || 'Stand-in Helper'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-2 border-red-300 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-base font-bold text-red-900">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Rating Selector */}
          <div className="text-center space-y-2">
            <label className="block text-base font-bold text-slate-900">
              How would you rate today's care visit?
            </label>
            <div className="flex justify-center gap-2 pt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-2 text-amber-400 focus:outline-none transition-transform hover:scale-125 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <Star
                    className={`w-9 h-9 ${
                      (hoverRating || rating) >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm font-bold text-slate-600">
              {rating === 5 && 'Outstanding · Punctual & Highly Caring'}
              {rating === 4 && 'Very Good · Assisted parent effectively'}
              {rating === 3 && 'Average · Met expectations'}
              {rating <= 2 && 'Needs Improvement · Let operations know'}
            </p>
          </div>

          {/* Comment text */}
          <div className="space-y-1">
            <label className="block text-base font-bold text-slate-900">
              Share details about the visit (Optional)
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Anand was gentle and took great care of my father during his hospital visit."
              className="w-full px-4 py-3 text-base border-2 border-slate-300 rounded-2xl focus:border-teal-600 focus:outline-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-lg rounded-2xl min-h-[48px] shadow-md transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              {submitting ? 'Submitting...' : 'Submit Rating & Review'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl min-h-[48px]"
            >
              Skip
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
