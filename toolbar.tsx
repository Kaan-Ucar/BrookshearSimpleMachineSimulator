import React from "react";
import ToolButton from "./toolButton";
import Slider from "./slider";
import Palette from "./palette";

class ToolBar extends React.Component<any, any> {
    constructor(props) {
        super(props);
    }

    render() {
        const style = {
            position: "fixed",
            top: 0,
            width: "100%",
            display: "flex",
            flexWrap: "wrap",
            flexShrink: 0,
            alignItems: "stretch",
            backgroundColor: Palette.toolBarBackground,
            color: Palette.toolBar
        } as React.CSSProperties;

        let runButton;
        if (this.props.running) {
            runButton = (
                <ToolButton
                    key="Pause"
                    icon="pause"
                    label="Pause"
                    onClick={this.props.onPause}
                />
            );
        }
        else {
            runButton = (
                <ToolButton
                    key="Run"
                    icon="play_arrow"
                    label="Run"
                    onClick={this.props.onRun}
                /> 
            );
        }

        return (
            <section style={style}>
                <ToolButton
                    key="Reset CPU"
                    icon="settings_backup_restore"
                    label="Reset CPU"
                    onClick={this.props.onResetCPU}
                />
                {runButton}
                <ToolButton 
                    key="Step Over"
                    icon="redo"
                    label="Step Over"
                    onClick={this.props.onStepOver}
                />
                <Slider label="Speed"
                    min={4000}
                    max={0}
                    defaultValue={2000}
                    onChange={this.props.onStepIntervalChange}
                />
            </section>
        );
    }
}

export default ToolBar;