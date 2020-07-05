import React from "react";
import ToolButton from "./toolButton";
import Slider from "./slider";
import Palette from "./palette";

class ToolBar extends React.Component<any, any> {
    render() {
        const style = {
            position: "fixed",
            top: 0,
            width: "100%",
            display: "flex",
            flexWrap: "wrap",
            flexShrink: 0,
            justifyContent: "space-between",
            backgroundColor: Palette.toolBarBackground,
            color: Palette.toolBar
        } as React.CSSProperties;

        const alignStyle = {
            display: "flex",
            alignItems: "stretch"
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
                <div style={alignStyle}>
                    <ToolButton
                        key="Reset CPU"
                        icon="settings_backup_restore"
                        label="Reset CPU"
                        onClick={this.props.onResetCPU}
                    />
                    <ToolButton
                        key="Reset Memory"
                        icon="memory"
                        label="Reset Memory"
                        onClick={this.props.onResetMemory}
                    />
                    <ToolButton
                        key="Build"
                        icon="build"
                        label="Build"
                        onClick={this.props.onBuild}
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
                </div>
                <div style={alignStyle}>
                    <a style={{ textDecoration: "none" }}
                        href="https://github.com/Kaan-Ucar/BrookshearSimpleMachineSimulator"
                        target="_blank"
                    >
                    <ToolButton
                        key="Source Code"
                        icon="code"
                        label="Source Code"
                        onClick={() => { }}
                    />
                    </a>
                </div>
            </section>
        );
    }
}

export default ToolBar;