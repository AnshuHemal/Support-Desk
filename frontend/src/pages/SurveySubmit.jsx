import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ThumbsUp, ThumbsDown, Send, CheckCircle, Clock, XCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SurveySubmit = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const [ratings, setRatings] = useState({
    overall: 0,
    responseTime: 0,
    professionalism: 0,
    knowledgeability: 0,
    problemResolution: 0,
  });

  const [feedback, setFeedback] = useState({
    positive: '',
    improvement: '',
    general: '',
  });

  const [npsScore, setNpsScore] = useState(null);
  const [hoveredRating, setHoveredRating] = useState({});

  useEffect(() => {
    fetchSurvey();
  }, [token]);

  const fetchSurvey = async () => {
    try {
      const response = await axios.get(`${API_URL}/surveys/public/${token}`);
      setSurvey(response.data);

      if (response.data.status === 'completed') {
        setSubmitted(true);
      } else if (response.data.status === 'expired') {
        setError('This survey has expired');
      }
    } catch (error) {
      console.error('Error fetching survey:', error);
      setError(error.response?.data?.message || 'Survey not found');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingClick = (category, value) => {
    setRatings({ ...ratings, [category]: value });
  };

  const handleNPSClick = (score) => {
    setNpsScore(score);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (ratings.overall === 0) {
      alert('Please provide an overall rating');
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(`${API_URL}/surveys/public/${token}/submit`, {
        ratings,
        feedback,
        npsScore,
        ipAddress: null, // Could be captured on backend
        userAgent: navigator.userAgent,
      });

      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting survey:', error);
      alert(error.response?.data?.message || 'Error submitting survey');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (category, label) => {
    const currentRating = ratings[category];
    const hovered = hoveredRating[category] || 0;

    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {category === 'overall' && <span className="text-red-500">*</span>}
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleRatingClick(category, star)}
              onMouseEnter={() => setHoveredRating({ ...hoveredRating, [category]: star })}
              onMouseLeave={() => setHoveredRating({ ...hoveredRating, [category]: 0 })}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                size={32}
                className={`${
                  star <= (hovered || currentRating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
          <span className="ml-3 text-sm text-gray-600 self-center">
            {currentRating > 0 ? `${currentRating} / 5` : 'Not rated'}
          </span>
        </div>
      </div>
    );
  };

  const renderNPS = () => {
    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          How likely are you to recommend our service to a friend or colleague?
        </label>
        <div className="flex gap-1 flex-wrap">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
            <button
              key={score}
              type="button"
              onClick={() => handleNPSClick(score)}
              className={`w-10 h-10 rounded-lg border-2 font-semibold transition-all ${
                npsScore === score
                  ? score <= 6
                    ? 'bg-red-500 text-white border-red-600'
                    : score <= 8
                    ? 'bg-yellow-500 text-white border-yellow-600'
                    : 'bg-green-500 text-white border-green-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }`}
            >
              {score}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Not at all likely</span>
          <span>Extremely likely</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading survey...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <XCircle size={64} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Survey Not Available</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-6">
            Your feedback has been submitted successfully. We appreciate you taking the time to
            help us improve our service.
          </p>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Your input helps us provide better support to all our customers.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {}
          <div className="bg-linear-to-r from-blue-600 to-blue-700 px-8 py-6 text-white">
            <h1 className="text-3xl font-bold mb-2">Customer Satisfaction Survey</h1>
            <p className="text-blue-100">
              Help us improve by sharing your experience with ticket #{survey?.ticket?.ticketNumber}
            </p>
          </div>

          {}
          <form onSubmit={handleSubmit} className="p-8">
            {}
            <div className="bg-gray-50 rounded-lg p-4 mb-8">
              <h3 className="font-semibold text-gray-900 mb-2">Ticket Details</h3>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Ticket:</span> #{survey?.ticket?.ticketNumber}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Title:</span> {survey?.ticket?.title}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Agent:</span> {survey?.agent?.name}
              </p>
            </div>

            {}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rate Your Experience</h3>
              {renderStars('overall', 'Overall Satisfaction')}
              {renderStars('responseTime', 'Response Time')}
              {renderStars('professionalism', 'Professionalism')}
              {renderStars('knowledgeability', 'Knowledge & Expertise')}
              {renderStars('problemResolution', 'Problem Resolution')}
            </div>

            {}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Net Promoter Score</h3>
              {renderNPS()}
            </div>

            {}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Feedback</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <ThumbsUp size={16} className="inline mr-1" />
                  What did we do well?
                </label>
                <textarea
                  value={feedback.positive}
                  onChange={(e) => setFeedback({ ...feedback, positive: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us what you liked..."
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <ThumbsDown size={16} className="inline mr-1" />
                  What could we improve?
                </label>
                <textarea
                  value={feedback.improvement}
                  onChange={(e) => setFeedback({ ...feedback, improvement: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us how we can improve..."
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Any other comments?
                </label>
                <textarea
                  value={feedback.general}
                  onChange={(e) => setFeedback({ ...feedback, general: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Additional feedback..."
                />
              </div>
            </div>

            {}
            <div className="flex justify-end gap-3">
              <button
                type="submit"
                disabled={submitting || ratings.overall === 0}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={20} />
                {submitting ? 'Submitting...' : 'Submit Survey'}
              </button>
            </div>

            {}
            <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
              <Clock size={16} />
              <span>
                This survey expires on {new Date(survey?.expiresAt).toLocaleDateString()}
              </span>
            </div>
          </form>
        </div>

        {}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Your feedback is confidential and helps us improve our service.</p>
        </div>
      </div>
    </div>
  );
};

export default SurveySubmit;
