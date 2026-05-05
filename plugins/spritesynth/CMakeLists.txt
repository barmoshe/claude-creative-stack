cmake_minimum_required(VERSION 3.22)

# Set deployment target BEFORE project() so it propagates to all toolchain probes.
# Without this, CMake defaults to the build host's macOS version (15.x in our case),
# which makes the resulting binary fail to load in Ableton — see JUCE forum 68723.
set(CMAKE_OSX_DEPLOYMENT_TARGET "11.0" CACHE STRING "macOS deployment target")

project(SpriteSynth VERSION 0.1.0 LANGUAGES C CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# JUCE 8.0.4+ is required — earlier WebView is unusable.
set(JUCE_MIN_VERSION "8.0.4")

include(FetchContent)
FetchContent_Declare(
    JUCE
    GIT_REPOSITORY https://github.com/juce-framework/JUCE.git
    GIT_TAG        8.0.4
    GIT_SHALLOW    TRUE
)
FetchContent_MakeAvailable(JUCE)

juce_add_plugin(SpriteSynth
    COMPANY_NAME             "claude-creative-stack"
    BUNDLE_ID                "com.ccs.spritesynth"
    PLUGIN_MANUFACTURER_CODE "Ccsk"
    PLUGIN_CODE              "SpSy"
    FORMATS                  VST3 AU Standalone
    PRODUCT_NAME             "SpriteSynth"
    PLUGIN_NAME              "SpriteSynth"
    DESCRIPTION              "Generative MIDI sequencer — animal creatures walk a mycelium network"
    # IS_SYNTH=TRUE so Ableton accepts as instrument; NEEDS_MIDI_OUTPUT=TRUE so
    # we can write notes into the host's MIDI buffer (Cthulhu pattern).
    # NEEDS_MIDI_INPUT=TRUE because Ableton expects synth instruments to declare
    # a MIDI input port in the VST3 manifest — without it the plugin fails to
    # open with "could not be opened". We still ignore any incoming events.
    IS_SYNTH                 TRUE
    NEEDS_MIDI_INPUT         TRUE
    NEEDS_MIDI_OUTPUT        TRUE
    IS_MIDI_EFFECT           FALSE
    EDITOR_WANTS_KEYBOARD_FOCUS TRUE
    COPY_PLUGIN_AFTER_BUILD  TRUE
    NEEDS_WEBVIEW2           TRUE
)

juce_generate_juce_header(SpriteSynth)

target_sources(SpriteSynth PRIVATE
    Source/PluginProcessor.cpp
    Source/PluginProcessor.h
    Source/PluginEditor.cpp
    Source/PluginEditor.h
    Source/EventQueue.h
    Source/Quantizer.h
    Source/ScaleTables.h
)

juce_add_binary_data(SpriteSynthWebData
    HEADER_NAME "WebData.h"
    NAMESPACE   WebData
    SOURCES
        Resources/web/index.html
        Resources/web/sim.js
        Resources/web/creatures.js
        Resources/web/scaleTables.js
        Resources/web/bridge.js
        Resources/web/styles.css
        Resources/web/jucefrontend.js
        Resources/web/check_native_interop.js
)

target_compile_definitions(SpriteSynth
    PUBLIC
        JUCE_WEB_BROWSER=1
        JUCE_USE_WIN_WEBVIEW2=1
        JUCE_USE_CURL=0
        JUCE_VST3_CAN_REPLACE_VST2=0
)

target_link_libraries(SpriteSynth
    PRIVATE
        SpriteSynthWebData
        juce::juce_audio_utils
        juce::juce_gui_extra
    PUBLIC
        juce::juce_recommended_config_flags
        juce::juce_recommended_lto_flags
        juce::juce_recommended_warning_flags
)
