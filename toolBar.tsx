import React from "react";
import ToolButton from "./toolButton";
import Slider from "./slider";
import Palette from "./palette";
import InfoBar from "./infoBar";

class ToolBar extends React.Component<any, any> {
    private _infoBar = React.createRef<InfoBar>();

    constructor(props) {
        super(props);

        this.state = {
            running: false
        };
    }

    render() {
        console.log("toolbar rendered");
        const style = {
            position: "fixed",
            top: 0,
            width: "100%",
            display: "flex",
            flexWrap: "wrap",
            overflow: "hidden",
            flexShrink: 0,
            backgroundColor: Palette.toolBarBackground,
            color: Palette.default,
            alignItems: "stretch"
        } as React.CSSProperties;

        let runButton;
        if (this.state.running) {
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
                <ToolButton
                    key="Reset Memory"
                    icon="memory"
                    label="Reset Memory"
                    onClick={this.props.onResetMemory}
                />
                <ToolButton
                    key="Clear Editor"
                    icon="restore_page"
                    label="Clear Editor"
                    onClick={this.props.onClearEditor}
                />
                <ToolButton
                    key="Build"
                    icon="build"
                    label="Build"
                    onClick={this.props.onBuild}
                />
                <ToolButton
                    key="Step Over"
                    icon="redo"
                    label="Step Over"
                    onClick={this.props.onStepOver}
                />
                {runButton}
                <Slider label="Speed"
                    min={4000}
                    max={0}
                    defaultValue={2000}
                    onChange={this.props.onStepTimeChange}
                />
                <InfoBar ref={this._infoBar}/>
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
            </section>
        );
    }

    setRunning(running: boolean) {
        this.setState({ running: running });
    }

    setProgress(progress: number) {
        this._infoBar.current.setProgress(progress);
    }

    setInfo(message: string, bold = false) {
        this._infoBar.current.setInfo(message, bold);
    }

    setError(message: string, bold = false) {
        this._infoBar.current.setError(message, bold);
    }

    setSuccess(message: string, bold = false) {
        this._infoBar.current.setSuccess(message, bold);
    }
}

export default ToolBar;