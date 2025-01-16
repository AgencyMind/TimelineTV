# TIMELINE TV

We all want to be the next shortform videostar. But do you really want to be the one on camera? I know I don't. Not dancing like a doofus like I am in this demo video. (Check it out, it's a rare sight). Now, with the power of Comfystream powered AI workflows I can send this one down the memory hole, and quickly switch between throwback early music television inspired overlays. Get your goofy expressions and best late night video DJ voice ready. Or spin up your favorite local TTS or voice converter. 

"Faceless" live streaming channel operators are standing by.  

[Demo Workflow Video](https://youtu.be/Y0i9hiX1740)

TIMELINE TV starts with depth maps and ControlNet, to make a quick toggle series of early music video TV style img2img prompt overlays for the background, foreground, and people in the videostream. 5 presets at the outset, calling back to some of the most iconic music video styles of the era.

At first I gave a try at setting up Yolov8 object detection nodes, which seems like a great plan. Tensorrt was running fast, so what could go wrong? In my earliest ComfyUI workflows, I set it up to detect an isolated object (like a mobile phone) on screen. It would automatically trigger switching between the preset list of the five custom styles: Sketchbook Romance, Cyborg Retro Future, Analog Americana, Boyy Lawper and Stardust Luxury.

I gave more hours than I want to admit, trying to integrate it with the ComfyStream server setup. But yeah, not so much. Getting it just right so the object detection node output could reliably trigger prompt updates called for more intensive tweaks than than I thought they would. While it's defintely doable, time ran out to get that feature working fully. For now, I’m submitting the base workflow with depth maps, ControlNet, and custom overlay prompts. To hold the line, the custom UI buttons make it super simple to manually switch preset styles, with setup steps outlined in the docs.

After testing through a variety of TensorRT nodes, I settled on Depth Anything TensorRT as it gave the fastest and most reliable input to ControlNet. Other options, like live pose for ControlNet, lost significant scene data too often, causing frame rates that were far too slow, and degraded responsiveness.

I'm planning to add in the object detection feature soon, bring a super cool upgrade live stream workflows to look forward to.

## Set Up 
1. The base setup for comfystream can be found in the [tutorial](https://livepeer.notion.site/ComfyStream-Dev-Environment-Setup-15d0a3485687802e9528d26050142d82) by @ryanontheinside

2. Replace the `ui folder` in ComfyStream with a clone of the`ui folder` in this repo so that you have the interface buttons for live prompt changes during the stream.

3. Download the [Civitai checkpoint](https://civitai.com/models/97744?modelVersionId=357360) to `comfyui/models/checkpoints`. 

4. Download the [controlnet model](https://huggingface.co/lllyasviel/ControlNet/blob/main/models/control_sd15_depth.pth) to `comfyui/models/controlnet`.

5. In `comfyui/custom_nodes/` clone Depth Anything tensorrt and download the model. Follow the *exact* steps from Eric's setup at Step 3. 