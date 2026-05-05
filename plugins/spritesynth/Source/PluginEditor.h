#pragma once

#include <juce_audio_processors/juce_audio_processors.h>
#include <juce_gui_extra/juce_gui_extra.h>
#include "PluginProcessor.h"

class SpriteSynthEditor : public juce::AudioProcessorEditor
{
public:
    explicit SpriteSynthEditor (SpriteSynthProcessor& p);
    ~SpriteSynthEditor() override;

    void paint (juce::Graphics&) override;
    void resized() override;

private:
    juce::WebBrowserComponent::Options buildWebOptions();

    juce::var handleBridgeReady (const juce::Array<juce::var>& args,
                                 juce::WebBrowserComponent::NativeFunctionCompletion completion);
    juce::var handlePushNode (const juce::Array<juce::var>& args,
                              juce::WebBrowserComponent::NativeFunctionCompletion completion);
    juce::var handlePushBond (const juce::Array<juce::var>& args,
                              juce::WebBrowserComponent::NativeFunctionCompletion completion);
    juce::var handlePushCreature (const juce::Array<juce::var>& args,
                                  juce::WebBrowserComponent::NativeFunctionCompletion completion);
    juce::var handleResetGraph (const juce::Array<juce::var>& args,
                                juce::WebBrowserComponent::NativeFunctionCompletion completion);

    SpriteSynthProcessor& proc;

    // Order matters for destruction: relays first, WebView middle, attachments last.
    std::vector<std::unique_ptr<juce::WebSliderRelay>>      sliderRelays;
    std::vector<std::unique_ptr<juce::WebToggleButtonRelay>> toggleRelays;
    std::vector<std::unique_ptr<juce::WebComboBoxRelay>>     choiceRelays;

    juce::WebBrowserComponent webView;

    std::vector<std::unique_ptr<juce::WebSliderParameterAttachment>>     sliderAttachments;
    std::vector<std::unique_ptr<juce::WebToggleButtonParameterAttachment>> toggleAttachments;
    std::vector<std::unique_ptr<juce::WebComboBoxParameterAttachment>>     choiceAttachments;

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (SpriteSynthEditor)
};
