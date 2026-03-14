type TimesheetHeaderProps = {
    weekLabel: string;
    progressText: string;
};

export function TimesheetHeader({
                                    weekLabel,
                                    progressText,
                                }: TimesheetHeaderProps) {
    return (
        <div className="timesheet-header">
            <h5>{weekLabel}</h5>
            <span className="progress-text">{progressText}</span>
        </div>
    );
}