
export const AIBriefing = ({ currentTemp, weatherDesc }) => {
    const generateSummary = () => {
        const condition = weatherDesc ? weatherDesc.toLowerCase() : 'clear sky';
        let summary = `The current temperature is ${currentTemp}°C with ${condition}. `;
        if (currentTemp > 30) summary += "It's quite hot, stay hydrated!";
        else if (currentTemp < 10) summary += "It's chilly, you might need a jacket.";
        else summary += "The weather is pleasant overall.";
        return summary;
    };

    return (
        <div className="ai-briefing glass-inner mt-2 flex">
            <i className="fa-solid fa-sparkles text-accent" aria-hidden="true"></i>
            <span id="ai-summary" className="font-inter text-sm">{generateSummary()}</span>
        </div>
    );
};

