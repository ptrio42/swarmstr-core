import {NoteSummary} from "../NoteSummary/NoteSummary";
import React from "react";

interface QuestionSummaryProps {
    id: string;
}

export const QuestionSummary = ({ id }: QuestionSummaryProps) => {
    const summary = '';

    if (summary === '') {
        return null;
    }

    return <NoteSummary content={summary} />
};