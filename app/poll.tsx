import React, { useEffect, useState } from "react";
import { sendVote, receiveVotes, retrieveExistingVotes } from "./waku";
import { questions } from "./questions";
import { LightNode } from "@waku/sdk";
import { IPollMessage } from "./type";

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
    <div className="bg-gray-200 flex items-center justify-center h-screen">
      <div className="container mx-auto px-4">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          {/* Display the current question */}
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            {question.question}
          </h2>
          <div className="space-y-3">
            {/* Render buttons for each answer option */}
            {question.answers.map((answer, index) => (
              <div key={index}>
                <button
                  className={`w-full text-lg py-2 px-4 rounded-lg transition-colors duration-300 ${
                    vote === null
                      ? "bg-blue-500 hover:bg-blue-600 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  onClick={() => handleVoteSend(index)}
                  disabled={vote !== null}
                >
                  {answer}
                </button>
                {/* Display vote count for each option */}
                <p className="text-sm text-gray-600 mt-1">
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
