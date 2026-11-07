import React, { useState, useEffect } from 'react';
import { Globe, MapPin, Trophy, Clock, Star, Compass } from 'lucide-react';

export function GeographyDash() {
    const [gameMode, setGameMode] = useState('menu'); // 'menu', 'countries', 'capitals', 'landmarks', 'gameOver'
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [timeLeft, setTimeLeft] = useState(30);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [questionsAnswered, setQuestionsAnswered] = useState(0);

    const countries = [
        { name: 'France', capital: 'Paris', continent: 'Europe', flag: '🇫🇷' },
        { name: 'Japan', capital: 'Tokyo', continent: 'Asia', flag: '🇯🇵' },
        { name: 'Brazil', capital: 'Brasília', continent: 'South America', flag: '🇧🇷' },
        { name: 'Australia', capital: 'Canberra', continent: 'Oceania', flag: '🇦🇺' },
        { name: 'Canada', capital: 'Ottawa', continent: 'North America', flag: '🇨🇦' },
        { name: 'Egypt', capital: 'Cairo', continent: 'Africa', flag: '🇪🇬' },
        { name: 'India', capital: 'New Delhi', continent: 'Asia', flag: '🇮🇳' },
        { name: 'Germany', capital: 'Berlin', continent: 'Europe', flag: '🇩🇪' },
        { name: 'Mexico', capital: 'Mexico City', continent: 'North America', flag: '🇲🇽' },
        { name: 'South Africa', capital: 'Cape Town', continent: 'Africa', flag: '🇿🇦' },
        { name: 'China', capital: 'Beijing', continent: 'Asia', flag: '🇨🇳' },
        { name: 'United Kingdom', capital: 'London', continent: 'Europe', flag: '🇬🇧' },
        { name: 'United States', capital: 'Washington D.C.', continent: 'North America', flag: '🇺🇸' },
        { name: 'Russia', capital: 'Moscow', continent: 'Europe/Asia', flag: '🇷🇺' },
        { name: 'Italy', capital: 'Rome', continent: 'Europe', flag: '🇮🇹' },
        { name: 'Spain', capital: 'Madrid', continent: 'Europe', flag: '🇪🇸' },
        { name: 'Argentina', capital: 'Buenos Aires', continent: 'South America', flag: '🇦🇷' },
        { name: 'Norway', capital: 'Oslo', continent: 'Europe', flag: '🇳🇴' },
        { name: 'Thailand', capital: 'Bangkok', continent: 'Asia', flag: '🇹🇭' },
        { name: 'Nigeria', capital: 'Abuja', continent: 'Africa', flag: '🇳🇬' }
    ];

    const landmarks = [
        { name: 'Eiffel Tower', country: 'France', emoji: '🗼' },
        { name: 'Great Wall of China', country: 'China', emoji: '🏯' },
        { name: 'Statue of Liberty', country: 'United States', emoji: '🗽' },
        { name: 'Taj Mahal', country: 'India', emoji: '🕌' },
        { name: 'Sydney Opera House', country: 'Australia', emoji: '🎭' },
        { name: 'Machu Picchu', country: 'Peru', emoji: '🏔️' },
        { name: 'Big Ben', country: 'United Kingdom', emoji: '🕰️' },
        { name: 'Christ the Redeemer', country: 'Brazil', emoji: '⛪' },
        { name: 'Pyramids of Giza', country: 'Egypt', emoji: '🔺' },
        { name: 'Colosseum', country: 'Italy', emoji: '🏛️' }
    ];

    const generateQuestion = (mode) => {
        let question, correctAnswer, options = [];

        if (mode === 'countries') {
            const country = countries[Math.floor(Math.random() * countries.length)];
            const questionTypes = ['flag', 'continent'];
            const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];

            if (type === 'flag') {
                question = `Which country's flag is this: ${country.flag}?`;
                correctAnswer = country.name;
                options = [country.name];
                while (options.length < 4) {
                    const wrongCountry = countries[Math.floor(Math.random() * countries.length)];
                    if (!options.includes(wrongCountry.name)) {
                        options.push(wrongCountry.name);
                    }
                }
            } else {
                question = `In which continent is ${country.name} located?`;
                correctAnswer = country.continent;
                const continents = ['Europe', 'Asia', 'Africa', 'North America', 'South America', 'Oceania'];
                options = continents.filter(c => c !== country.continent).slice(0, 3);
                options.push(country.continent);
            }
        }

        else if (mode === 'capitals') {
            const country = countries[Math.floor(Math.random() * countries.length)];
            question = `What is the capital of ${country.name}?`;
            correctAnswer = country.capital;
            options = [country.capital];
            while (options.length < 4) {
                const wrongCountry = countries[Math.floor(Math.random() * countries.length)];
                if (!options.includes(wrongCountry.capital)) {
                    options.push(wrongCountry.capital);
                }
            }
        }

        else if (mode === 'landmarks') {
            const landmark = landmarks[Math.floor(Math.random() * landmarks.length)];
            question = `In which country would you find the ${landmark.name} ${landmark.emoji}?`;
            correctAnswer = landmark.country;
            options = [landmark.country];
            while (options.length < 4) {
                const wrongCountry = countries[Math.floor(Math.random() * countries.length)];
                if (!options.includes(wrongCountry.name)) {
                    options.push(wrongCountry.name);
                }
            }
        }

        options = options.sort(() => Math.random() - 0.5);
        setCurrentQuestion({ question, correctAnswer, options });
    };

    const handleAnswer = (selectedAnswer) => {
        const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

        if (isCorrect) {
            const points = (10 + streak * 2) * (timeLeft > 20 ? 2 : timeLeft > 10 ? 1.5 : 1);
            setScore(prev => prev + Math.floor(points));
            setStreak(prev => {
                const newStreak = prev + 1;
                setBestStreak(current => Math.max(current, newStreak));
                return newStreak;
            });
            setFeedback('Correct! 🎉');
            setTimeLeft(prev => Math.min(30, prev + 3));
        } else {
            setLives(prev => prev - 1);
            setStreak(0);
            setFeedback(`Incorrect! The answer was ${currentQuestion.correctAnswer}.`);
        }

        setQuestionsAnswered(prev => prev + 1);

        setTimeout(() => {
            setFeedback('');
            if (lives > (isCorrect ? 0 : 1)) {
                generateQuestion(gameMode);
            } else if (!isCorrect) {
                setGameMode('gameOver');
            }
        }, 1500);
    };

    const startGame = (mode) => {
        setGameMode(mode);
        setScore(0);
        setLives(3);
        setTimeLeft(30);
        setStreak(0);
        setQuestionsAnswered(0);
        setFeedback('');
        generateQuestion(mode);
    };

    useEffect(() => {
        let timer;
        if ((gameMode === 'countries' || gameMode === 'capitals' || gameMode === 'landmarks') && timeLeft > 0) {
            timer = setTimeout(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && gameMode !== 'menu' && gameMode !== 'gameOver') {
            setGameMode('gameOver');
        }
        return () => clearTimeout(timer);
    }, [timeLeft, gameMode]);

    const GameContainer = ({ children }) => (
        <div className="min-h-screen font-serif flex items-center justify-center p-4 bg-[#f4f1e9]">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/old-map.png')] opacity-20"></div>
            <div className="relative w-full max-w-4xl">{children}</div>
        </div>
    );
    
    if (gameMode === 'menu') {
        return (
            <GameContainer>
                <div className="bg-[#fdfaf2]/80 backdrop-blur-sm rounded-2xl p-8 w-full border-2 border-[#d3cbbd] shadow-2xl text-center">
                    <h1 className="text-5xl font-bold text-[#5a4c3b] mb-2" style={{ fontFamily: "'Cinzel', serif" }}>Geography Dash</h1>
                    <p className="text-[#8c7b62] text-lg mb-8">An Explorer's Challenge of the World</p>

                    {bestStreak > 0 && (
                        <div className="mb-8">
                            <div className="bg-[#e4dace]/50 rounded-xl p-3 inline-flex items-center gap-2 border border-[#d3cbbd]">
                                <Trophy className="w-5 h-5 text-yellow-600" />
                                <span className="font-semibold text-[#6e5f4c]">Best Streak: {bestStreak}</span>
                            </div>
                        </div>
                    )}
                    
                    <div className="grid gap-6 md:grid-cols-3">
                        <button onClick={() => startGame('countries')} className="bg-[#4a8a7b] hover:bg-[#3b6e62] text-white font-bold py-6 px-4 rounded-xl transition-all duration-300 transform hover:-translate-y-1 shadow-lg border-b-4 border-[#325a50]">
                            <Globe className="w-10 h-10 mx-auto mb-2" />
                            <span>Countries</span>
                            <span className="text-sm opacity-80 block">Flags & Continents</span>
                        </button>
                        <button onClick={() => startGame('capitals')} className="bg-[#a65d48] hover:bg-[#854a39] text-white font-bold py-6 px-4 rounded-xl transition-all duration-300 transform hover:-translate-y-1 shadow-lg border-b-4 border-[#6b3b2d]">
                            <MapPin className="w-10 h-10 mx-auto mb-2" />
                            <span>Capitals</span>
                            <span className="text-sm opacity-80 block">City Knowledge</span>
                        </button>
                        <button onClick={() => startGame('landmarks')} className="bg-[#4b6a96] hover:bg-[#3c5578] text-white font-bold py-6 px-4 rounded-xl transition-all duration-300 transform hover:-translate-y-1 shadow-lg border-b-4 border-[#2f435e]">
                            <Compass className="w-10 h-10 mx-auto mb-2" />
                            <span>Landmarks</span>
                            <span className="text-sm opacity-80 block">Famous Places</span>
                        </button>
                    </div>
                </div>
            </GameContainer>
        );
    }

    if (gameMode === 'gameOver') {
        return (
            <GameContainer>
                <div className="bg-[#fdfaf2]/80 backdrop-blur-sm rounded-2xl p-8 text-center w-full max-w-md mx-auto border-2 border-[#d3cbbd] shadow-2xl">
                    <div className="text-7xl mb-4">
                        {score > 200 ? '🏆' : score > 100 ? ' explorers-society-medallion-silver-big.png ' : '🥉'}
                    </div>
                    <h1 className="text-4xl font-bold text-[#5a4c3b] mb-6" style={{ fontFamily: "'Cinzel', serif" }}>Expedition Complete!</h1>
                    
                    <div className="space-y-4 mb-8">
                        <div className="bg-[#e4dace]/50 rounded-xl p-4 border border-[#d3cbbd]">
                            <div className="text-sm text-[#8c7b62] mb-1">Final Score</div>
                            <div className="text-4xl font-bold text-[#5a4c3b]">{score}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#e4dace]/50 rounded-xl p-3 border border-[#d3cbbd]">
                                <div className="text-xs text-[#8c7b62] mb-1">Questions</div>
                                <div className="text-2xl font-bold text-[#5a4c3b]">{questionsAnswered}</div>
                            </div>
                            <div className="bg-[#e4dace]/50 rounded-xl p-3 border border-[#d3cbbd]">
                                <div className="text-xs text-[#8c7b62] mb-1">Best Streak</div>
                                <div className="text-2xl font-bold text-[#5a4c3b]">{bestStreak}</div>
                            </div>
                        </div>
                    </div>
                    
                    <button onClick={() => setGameMode('menu')} className="w-full bg-[#a65d48] hover:bg-[#854a39] text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:-translate-y-1 shadow-lg border-b-4 border-[#6b3b2d]">
                        New Expedition
                    </button>
                </div>
            </GameContainer>
        );
    }

    return (
        <GameContainer>
            <header className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-[#fdfaf2]/80 backdrop-blur-sm rounded-lg p-3 flex items-center justify-center gap-2 border border-[#d3cbbd] shadow-md">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                    <span className="text-[#5a4c3b] font-bold text-lg">{score}</span>
                </div>
                <div className="bg-[#fdfaf2]/80 backdrop-blur-sm rounded-lg p-3 flex items-center justify-center gap-2 border border-[#d3cbbd] shadow-md">
                    <Clock className="w-5 h-5 text-[#a65d48]" />
                    <span className="text-[#5a4c3b] font-bold text-lg">{timeLeft}s</span>
                </div>
                <div className="bg-[#fdfaf2]/80 backdrop-blur-sm rounded-lg p-3 flex items-center justify-center gap-2 border border-[#d3cbbd] shadow-md">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <span key={i} className={`text-2xl text-[#a65d48] transition-opacity duration-300 ${i < lives ? 'opacity-100' : 'opacity-20'}`}>♥</span>
                    ))}
                </div>
            </header>

            <main className="bg-[#fdfaf2]/80 backdrop-blur-sm rounded-2xl p-8 border-2 border-[#d3cbbd] shadow-2xl">
                <div className="text-center">
                    <p className="text-sm text-[#8c7b62] uppercase tracking-widest mb-4">Question {questionsAnswered + 1}</p>
                    <div className="text-2xl md:text-3xl font-bold text-[#5a4c3b] min-h-[100px] flex items-center justify-center mb-8">
                        {currentQuestion?.question}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentQuestion?.options.map((option, index) => (
                            <button key={index} onClick={() => handleAnswer(option)} disabled={feedback !== ''}
                                className="bg-[#e4dace]/50 hover:bg-[#d3cbbd]/70 disabled:hover:bg-[#e4dace]/50 border-2 border-[#d3cbbd] rounded-xl py-4 px-6 text-[#5a4c3b] font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:cursor-not-allowed disabled:transform-none shadow-sm"
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                    {feedback && (
                        <div className={`mt-6 text-xl font-bold transition-opacity duration-300 ${feedback.includes('Correct') ? 'text-green-700' : 'text-red-700'}`}>
                            {feedback}
                        </div>
                    )}
                </div>
            </main>
            
            <footer className="text-center mt-6">
                <button onClick={() => setGameMode('menu')} className="bg-[#fdfaf2]/60 hover:bg-[#e4dace]/80 text-[#8c7b62] px-6 py-2 rounded-full transition-colors duration-300 text-sm font-semibold border border-[#d3cbbd] shadow-sm">
                    End Expedition
                </button>
            </footer>
        </GameContainer>
    );
}

export const metadata = {
    name: "Geography Dash",
    gradeLevel: "6-12",
    category: "Geography",
    icon: "🌍"
};

