import { useState, useEffect } from 'react';

const AIInterviewer = ({ 
  currentQuestion, 
  questionIndex, 
  totalQuestions,
  onAnswerSubmit,
  isSpeaking = false 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (currentQuestion) {
      setIsAnimating(true);
      setDisplayedText('');
      
      // Animate text typing
      let index = 0;
      const questionText = currentQuestion.question;
      const typingInterval = setInterval(() => {
        if (index < questionText.length) {
          setDisplayedText(questionText.substring(0, index + 1));
          index++;
        } else {
          clearInterval(typingInterval);
          setIsAnimating(false);
        }
      }, 30);

      return () => clearInterval(typingInterval);
    }
  }, [currentQuestion]);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 border-2 border-blue-200">
      {/* AI Avatar */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          {/* Animated Avatar */}
          <div className={`w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-lg ${isAnimating ? 'animate-pulse' : ''}`}>
            <svg
              className="w-16 h-16 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          
          {/* Speaking Indicator */}
          {isSpeaking && (
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
        </div>
        
        <h3 className="mt-4 text-xl font-bold text-gray-800">AI Interviewer</h3>
        <p className="text-sm text-gray-600">Question {questionIndex + 1} of {totalQuestions}</p>
      </div>

      {/* Question Display */}
      <div className="bg-white rounded-lg p-6 shadow-md min-h-[120px]">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-gray-800 text-lg leading-relaxed">
              {displayedText}
              {isAnimating && <span className="animate-pulse">|</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((questionIndex + 1) / totalQuestions) * 100}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-600 mt-1 text-center">
          Progress: {questionIndex + 1} / {totalQuestions}
        </p>
      </div>
    </div>
  );
};

export default AIInterviewer;
