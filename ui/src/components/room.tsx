"use client";

import { PeerConnector } from "@/components/peer";
import { StreamConfig, StreamSettings } from "@/components/settings";
import { Webcam } from "@/components/webcam";
import { usePeerContext } from "@/context/peer-context";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ControlPanelsContainer } from "@/components/control-panels-container";
interface MediaStreamPlayerProps {
  stream: MediaStream;
}

const ALL_PROMPTS = [
  {
    title: "Sketchbook Romance",
    prompt:
      "A performer emerges from the pages of a sketch-book style monochromatic, hand-drawn comic book, their pencil-sketched outline blending with live-action romance and real-world textures. The background shifts between a cozy café filled with warm, diffused sunlight and a dynamic pencil-drawn world of abstract corridors and twisting mechanical obstacles. The subject wears a minimalist, fitted jacket and tousled hair, exuding youthful charm. Fluid rotoscoped animation seamlessly transitions between hand-drawn and live-action, creating a surreal, dreamlike experience. Lighting alternates between soft natural tones in the café and stark, high-contrast shading in the sketch world. The foreground is alive with rippling pencil strokes that react to the performer’s movements, blurring the boundaries between art and reality",
  },
  {
    title: "Cyborg Retro Future",
    prompt:
      "A futuristic figure draped in a shimmering silver bodysuit with glowing accents strides across a vast digital grid stretching to a glowing horizon. Their stylized helmet emits pulsating light patterns synced to the music. The background features wireframe mountains, floating geometric shapes, and simulated starfields. Fog rolls across the ground, catching beams of cool-toned laser lights. The visual effects blend early CGI with vibrant, analog-inspired overlays of VHS scan lines and digital artifacts. Each motion leaves an ethereal, neon-colored motion trail as if they are part of the simulation.",
  },
  {
    title: "Analog Americana",
    prompt:
      "A nostalgic figure dressed in a pastel bomber jacket and acid-washed jeans leans against a classic car under a warm, golden sunset. The background alternates between a palm tree-lined boulevard and a sandy beach with waves crashing in slow motion. Foreground elements include Polaroid photos fluttering in the breeze and a cassette tape spinning in a vintage deck. The lighting is soft and diffused, casting long shadows. The video transitions between dreamy dissolves, overexposed film shots, and grainy VHS-style footage, creating an intimate and sentimental aesthetic.",
  },
  {
    title: "Boyy Lawper",
    prompt:
      "A performer clad in an explosion of vibrant, mismatched patterns—think polka dots, stripes, and paisley—sways in front of a backdrop of swirling rainbow fractals. The floor is covered in metallic confetti, which shimmers under pulsating blacklights. Their makeup is avant-garde, with bold, geometric shapes and glitter accents. The camera spins and zooms unpredictably, intercut with kaleidoscopic effects and saturated overlays of blooming flowers and shifting abstract shapes. Lighting alternates between UV glow and intense strobes in rhythmic bursts, enhancing the trippy, kaleidoscopic vibe.",
  },
  {
    title: "Stardust Luxury",
    prompt:
      "A surreal white beach under an overcast sky, with David Bowie as a Pierrot clown in a shimmering white costume with pastel accents and theatrical makeup. His striking eyes feature one permanently dilated pupil, giving an intense, otherworldly gaze. Abstract, faceless figures and fragmented landscapes create an eerie, dreamlike atmosphere. Bright, clinical lighting highlights glittering textures, casting long shadows across the sand. Glowing orbs, buried televisions emitting static, and geometric shapes punctuate the scene. Soft pink, blue, and gold hues give the visuals a hypnotic, melancholic tone, with fluid, theatrical movements adding to the surreal energy.",
  },
];

function MediaStreamPlayer({ stream }: MediaStreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className="w-full h-full"
    />
  );
}

interface StageProps {
  connected: boolean;
  onStreamReady: () => void;
}

function Stage({ connected, onStreamReady }: StageProps) {
  const { remoteStream, peerConnection } = usePeerContext();
  const [frameRate, setFrameRate] = useState<number>(0);

  useEffect(() => {
    if (!connected || !remoteStream) return;

    onStreamReady();

    const interval = setInterval(() => {
      if (peerConnection) {
        peerConnection.getStats().then((stats) => {
          stats.forEach((report) => {
            if (report.type === "inbound-rtp" && report.kind === "video") {
              const currentFrameRate = report.framesPerSecond;
              if (currentFrameRate) {
                setFrameRate(Math.round(currentFrameRate));
              }
            }
          });
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [connected, remoteStream, peerConnection, onStreamReady]);

  if (!connected || !remoteStream) {
    return (
      <>
        <video
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/loading.mp4" type="video/mp4" />
        </video>
      </>
    );
  }

  return (
    <div className="relative">
      <MediaStreamPlayer stream={remoteStream} />
      <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>{frameRate} FPS</TooltipTrigger>
            <TooltipContent>
              <p>This is the FPS of the output stream.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

export function Room() {
  const [connect, setConnect] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [promptCurrent, setPromptCurrent] = useState<string>(
    ALL_PROMPTS[0].title
  );
  const [isStreamSettingsOpen, setIsStreamSettingsOpen] =
    useState<boolean>(true);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [loadingToastId, setLoadingToastId] = useState<
    string | number | undefined
  >(undefined);

  
  const handlePromptToServer = async (input: {
    title: string;
    prompt: string;
  }) => {
    setPromptCurrent(input.title);
    let promptTextChange: any = config.prompt;
    promptTextChange[4].inputs["text"] = input.prompt;
    try {
      await fetch("/api/prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: promptTextChange,
          endpoint: config.streamUrl,
        }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const [config, setConfig] = useState<StreamConfig>({
    streamUrl: "",
    frameRate: 0,
    selectedDeviceId: "",
    prompt: null,
  });

  const connectingRef = useRef(false);

  const onStreamReady = useCallback((stream: MediaStream) => {
    setLocalStream(stream);
  }, []);

  const onRemoteStreamReady = useCallback(() => {
    toast.success("Started stream!", { id: loadingToastId });
    setLoadingToastId(undefined);
  }, [loadingToastId]);

  const onStreamConfigSave = useCallback((config: StreamConfig) => {
    setConfig(config);
  }, []);

  useEffect(() => {
    if (connectingRef.current) return;

    if (!config.streamUrl) {
      setConnect(false);
    } else {
      setConnect(true);

      const id = toast.loading("Starting stream...");
      setLoadingToastId(id);

      connectingRef.current = true;
    }
  }, [config.streamUrl]);

  const handleConnected = useCallback(() => {
    setIsConnected(true);

    console.debug("Connected!");

    connectingRef.current = false;
  }, []);

  const handleDisconnected = useCallback(() => {
    setIsConnected(false);

    console.debug("Disconnected!");
  }, []);


  return (
    <main className="fixed inset-0 overflow-hidden overscroll-none">
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
      />
      <div className="fixed inset-0 z-[-1] bg-cover bg-[black]">
        <PeerConnector
          url={config.streamUrl}
          prompt={config.prompt}
          connect={connect}
          onConnected={handleConnected}
          onDisconnected={handleDisconnected}
          localStream={localStream}
        >
          <div className="min-h-[100dvh] flex flex-col items-center justify-start pt-[10vh] gap-3">
            <div className="relative w-full h-fit flex flex-wrap gap-2 items-center justify-center">
              {ALL_PROMPTS.map(
                (input: { title: string; prompt: string }, index: number) => {
                  return (
                    <div
                      onClick={() => handlePromptToServer(input)}
                      key={index}
                      className={`relative flex items-center justify-center w-fit h-10 flex py-1 px-2 border border-white rounded-sm hover:opacity-70 cursor-pointer text-sm ${
                        promptCurrent !== input.title
                          ? "bg-black text-white"
                          : "bg-white text-black"
                      }`}
                    >
                      {input.title}
                    </div>
                  );
                }
              )}
            </div>
            <div className="w-full max-h-[100dvh] flex flex-col lg:flex-row landscape:flex-row justify-center items-center lg:space-x-4">
              <div className="landscape:w-full lg:w-1/2 h-[50dvh] lg:h-auto landscape:h-full max-w-[512px] max-h-[512px] aspect-square bg-[black] flex justify-center items-center border-2 rounded-md">
                <Stage
                  connected={isConnected}
                  onStreamReady={onRemoteStreamReady}
                />
              </div>
              <div className="landscape:w-full lg:w-1/2 h-[50dvh] lg:h-auto landscape:h-full max-w-[512px] max-h-[512px] aspect-square flex justify-center items-center lg:border-2 lg:rounded-md">
                <Webcam
                  onStreamReady={onStreamReady}
                  deviceId={config.selectedDeviceId}
                  frameRate={config.frameRate}
                />
              </div>
            </div>

            {isConnected && <ControlPanelsContainer />}

            <StreamSettings
              open={isStreamSettingsOpen}
              onOpenChange={setIsStreamSettingsOpen}
              onSave={onStreamConfigSave}
            />
          </div>
        </PeerConnector>
      </div>
    </main>
  );
}
