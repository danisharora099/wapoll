import React, { useEffect, useState } from "react";
import { sendVote, receiveVotes, retrieveExistingVotes } from "./lib/waku";
import { questions } from "./config/questions";
import { LightNode } from "@waku/sdk";
import { IPollMessage } from "./types";

interface IProps {
  waku: LightNode; // Passing the Waku instance as a prop
}

const Poll: React.FC<IProps> = ({ waku }) => {
  // State to track the selected vote option
  const [vote, setVote] = useState<number | null>(null);

  // State to track vote counts for each option
  const [voteCounts, setVoteCounts] = useState<number[]>(
    new Array(questions[0].answers.length).fill(0),
  );

  // Current question - assuming single question handling
  const question = questions[0];

  // Function to handle sending a vote
  const handleVoteSend = async (optionIndex: number) => {
    setVote(optionIndex); // Set the selected vote
    // Send the vote using the Waku network
    sendVote(waku, {
      id: question.id,
      question: question.question,
      answers: [question.answers[optionIndex]],
    });
  };

  const processReceivedVote = (pollMessage: IPollMessage) => {
    pollMessage.answers.forEach((answer) => {
      const answerIndex = question.answers.indexOf(answer);
      // Update the vote counts state
      if (answerIndex !== -1) {
        setVoteCounts((prevCounts) => {
          const newCounts = [...prevCounts];
          newCounts[answerIndex]++;
          return newCounts;
        });
      }
    });
  };

  useEffect(() => {
    const subscribeToVotes = async () => {
      console.log("Poll: Listening for votes");
      await retrieveExistingVotes(waku, processReceivedVote);
      await receiveVotes(waku, processReceivedVote);
    };

    subscribeToVotes();
  }, [waku]);

  return (
    <div className="bg-black flex items-center justify-center h-screen">
      <div className="container mx-auto px-4">
        <div className="flex justify-between text-center mb-10 space-x-3 items-center">
          <div className="flex space-x-2 items-center">
            <svg width="50" height="50" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="M7 18H4V8h3m5 10H9V4h3m5 14h-3v-7h3Z" />
            </svg>
            <h1 className="text-2xl">WaPoll</h1>
          </div>
          <div className="flex space-x-2 items-center text-green-300">
            <svg width="15" height="15" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="M6.013 6.775a1.252 1.252 0 0 0-1.768 0l-.22.22A3.469 3.469 0 0 0 3 9.524c.012.756.26 1.47.71 2.059l-2.063 2.063a.5.5 0 0 0 .708.707l2.07-2.07a3.448 3.448 0 0 0 2.036.652c.938 0 1.888-.363 2.604-1.08l.131-.131a1.252 1.252 0 0 0 0-1.768L6.014 6.774v.001Zm8.341-5.129a.5.5 0 0 0-.707 0l-2.07 2.07c-1.37-.999-3.37-.843-4.64.428l-.13.131a1.252 1.252 0 0 0 0 1.768l3.181 3.182c.243.244.563.366.884.366c.321 0 .641-.122.884-.366l.22-.22a3.469 3.469 0 0 0 1.025-2.529a3.463 3.463 0 0 0-.71-2.059l2.063-2.063a.502.502 0 0 0 0-.708Z" />
            </svg>
            <h1>Connected</h1>
          </div>
        </div>
        <div className="border p-6 rounded-lg shadow-lg">
          {/* Display the current question */}
          <h2 className="text-2xl font-semibold text-white mb-6">
            {question.question}
          </h2>
          <div className="space-y-3">
            {/* Render buttons for each answer option */}
            {question.answers.map((answer, index) => (
              <div key={index}>
                <button
                  className={`w-full text-lg py-2 px-4 rounded-lg transition-colors duration-300 ${vote === null
                    ? "bg-gray-400 hover:bg-white text-black"
                    : "bg-gray-400 text-black cursor-not-allowed"
                    }`}
                  onClick={() => handleVoteSend(index)}
                  disabled={vote !== null}
                >
                  {answer}
                </button>
                {/* Display vote count for each option */}
                <p className="text-sm text-white opacity-60 mt-1">
                  Votes: {voteCounts[index]}
                </p>
              </div>
            ))}
          </div>
          {/* Confirmation message after voting */}
          {vote !== null && (
            <div className="mt-6 p-4 rounded-lg bg-green-100 text-green-800">
              <p className="font-medium">
                You voted for: {question.answers[vote]}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Poll;
