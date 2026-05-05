#include "PluginEditor.h"
#include "WebData.h"

namespace
{
    std::optional<juce::WebBrowserComponent::Resource>
    fetchResource (const juce::String& path)
    {
        juce::Logger::writeToLog ("[SpriteSynth] WebView requested: " + path);

        auto file = path;
        while (file.startsWithChar ('/'))
            file = file.substring (1);
        if (file.isEmpty())
            file = "index.html";

        struct Mapping { const char* file; const char* mime; const char* binaryName; };
        static const Mapping table[] = {
            { "index.html",                "text/html",       "index_html"               },
            { "sim.js",                    "text/javascript", "sim_js"                   },
            { "creatures.js",              "text/javascript", "creatures_js"             },
            { "scaleTables.js",            "text/javascript", "scaleTables_js"           },
            { "bridge.js",                 "text/javascript", "bridge_js"                },
            { "styles.css",                "text/css",        "styles_css"               },
            { "jucefrontend.js",           "text/javascript", "jucefrontend_js"          },
            { "check_native_interop.js",   "text/javascript", "check_native_interop_js"  },
        };

        for (auto& m : table)
        {
            if (file == m.file)
            {
                int size = 0;
                const char* data = WebData::getNamedResource (m.binaryName, size);
                if (data == nullptr || size <= 0) break;

                juce::WebBrowserComponent::Resource r;
                const auto* bytes = reinterpret_cast<const std::byte*> (data);
                r.data.assign (bytes, bytes + size);
                r.mimeType = m.mime;
                return r;
            }
        }
        return std::nullopt;
    }
}

juce::WebBrowserComponent::Options SpriteSynthEditor::buildWebOptions()
{
    using Options = juce::WebBrowserComponent::Options;

    auto opts = Options{}
       #if JUCE_WINDOWS
        .withBackend (Options::Backend::webview2)
        .withWinWebView2Options (Options::WinWebView2{}
            .withUserDataFolder (juce::File::getSpecialLocation (juce::File::tempDirectory)))
       #endif
        .withResourceProvider ([] (const juce::String& p) { return fetchResource (p); })
        .withNativeIntegrationEnabled (true)
        .withNativeFunction ("bridgeReady",
            [this] (const juce::Array<juce::var>& args,
                    juce::WebBrowserComponent::NativeFunctionCompletion completion)
            { handleBridgeReady (args, std::move (completion)); })
        .withNativeFunction ("pushNode",
            [this] (const juce::Array<juce::var>& args,
                    juce::WebBrowserComponent::NativeFunctionCompletion completion)
            { handlePushNode (args, std::move (completion)); })
        .withNativeFunction ("pushBond",
            [this] (const juce::Array<juce::var>& args,
                    juce::WebBrowserComponent::NativeFunctionCompletion completion)
            { handlePushBond (args, std::move (completion)); })
        .withNativeFunction ("pushCreature",
            [this] (const juce::Array<juce::var>& args,
                    juce::WebBrowserComponent::NativeFunctionCompletion completion)
            { handlePushCreature (args, std::move (completion)); })
        .withNativeFunction ("resetGraph",
            [this] (const juce::Array<juce::var>& args,
                    juce::WebBrowserComponent::NativeFunctionCompletion completion)
            { handleResetGraph (args, std::move (completion)); });

    auto& apvts = proc.getApvts();

    auto wireToggle = [&] (const juce::String& id)
    {
        auto relay = std::make_unique<juce::WebToggleButtonRelay> (id);
        opts = opts.withOptionsFrom (*relay);
        if (auto* p = apvts.getParameter (id))
            toggleAttachments.push_back (
                std::make_unique<juce::WebToggleButtonParameterAttachment> (*p, *relay, nullptr));
        toggleRelays.push_back (std::move (relay));
    };
    auto wireSlider = [&] (const juce::String& id)
    {
        auto relay = std::make_unique<juce::WebSliderRelay> (id);
        opts = opts.withOptionsFrom (*relay);
        if (auto* p = apvts.getParameter (id))
            sliderAttachments.push_back (
                std::make_unique<juce::WebSliderParameterAttachment> (*p, *relay, nullptr));
        sliderRelays.push_back (std::move (relay));
    };
    auto wireChoice = [&] (const juce::String& id)
    {
        auto relay = std::make_unique<juce::WebComboBoxRelay> (id);
        opts = opts.withOptionsFrom (*relay);
        if (auto* p = apvts.getParameter (id))
            choiceAttachments.push_back (
                std::make_unique<juce::WebComboBoxParameterAttachment> (*p, *relay, nullptr));
        choiceRelays.push_back (std::move (relay));
    };

    wireToggle ("internalSound");
    wireChoice ("scale");
    wireChoice ("root");
    wireSlider ("octave");

    return opts;
}

SpriteSynthEditor::SpriteSynthEditor (SpriteSynthProcessor& p)
    : AudioProcessorEditor (&p),
      proc (p),
      webView (buildWebOptions())
{
    setSize (820, 540);
    setResizable (true, true);
    setResizeLimits (480, 320, 3840, 2160);

    addAndMakeVisible (webView);
    juce::Logger::writeToLog ("[editor] opening URL: " + juce::WebBrowserComponent::getResourceProviderRoot());
    webView.goToURL (juce::WebBrowserComponent::getResourceProviderRoot());
}

SpriteSynthEditor::~SpriteSynthEditor() = default;

void SpriteSynthEditor::paint (juce::Graphics& g)
{
    g.fillAll (juce::Colour::fromRGB (0x06, 0x05, 0x0d));
}

void SpriteSynthEditor::resized()
{
    webView.setBounds (getLocalBounds());
}

juce::var SpriteSynthEditor::handleBridgeReady (const juce::Array<juce::var>& args,
                                                juce::WebBrowserComponent::NativeFunctionCompletion completion)
{
    juce::String marker = args.size() > 0 ? args[0].toString() : juce::String();
    juce::Logger::writeToLog ("[bridge] ready ping from JS: " + marker);
    completion ("ok");
    return {};
}

juce::var SpriteSynthEditor::handlePushNode (const juce::Array<juce::var>& args,
                                             juce::WebBrowserComponent::NativeFunctionCompletion completion)
{
    // JS sends: parentIdx (-1 for root), treeId, x, y, hue
    const int   parentIdx = args.size() > 0 ? (int) args[0] : -1;
    const int   treeId    = args.size() > 1 ? (int) args[1] : 0;
    const float x         = args.size() > 2 ? (float) (double) args[2] : 0.0f;
    const float y         = args.size() > 3 ? (float) (double) args[3] : 0.0f;
    const float hue       = args.size() > 4 ? (float) (double) args[4] : 140.0f;
    proc.getQueue().pushAddNode (parentIdx, treeId, x, y, hue);
    completion ("ok");
    return {};
}

juce::var SpriteSynthEditor::handlePushBond (const juce::Array<juce::var>& args,
                                             juce::WebBrowserComponent::NativeFunctionCompletion completion)
{
    const int aIdx = args.size() > 0 ? (int) args[0] : -1;
    const int bIdx = args.size() > 1 ? (int) args[1] : -1;
    proc.getQueue().pushAddBond (aIdx, bIdx);
    completion ("ok");
    return {};
}

juce::var SpriteSynthEditor::handlePushCreature (const juce::Array<juce::var>& args,
                                                 juce::WebBrowserComponent::NativeFunctionCompletion completion)
{
    // JS sends: rootNodeIdx, channel (1..16), beatsPerStep (e.g. 0.5 = eighth note)
    const int   rootIdx      = args.size() > 0 ? (int) args[0] : -1;
    const int   channel      = args.size() > 1 ? (int) args[1] : 1;
    const float beatsPerStep = args.size() > 2 ? (float) (double) args[2] : 0.5f;
    proc.getQueue().pushAddCreature (rootIdx,
                                     (uint8_t) juce::jlimit (1, 16, channel),
                                     juce::jlimit (0.0625f, 4.0f, beatsPerStep));
    completion ("ok");
    return {};
}

juce::var SpriteSynthEditor::handleResetGraph (const juce::Array<juce::var>& /*args*/,
                                               juce::WebBrowserComponent::NativeFunctionCompletion completion)
{
    proc.getQueue().pushReset();
    completion ("ok");
    return {};
}
