#pragma once

#include <juce_audio_processors/juce_audio_processors.h>
#include <juce_gui_extra/juce_gui_extra.h>
#include "PluginProcessor.h"

class MyceliumGroveEditor : public juce::AudioProcessorEditor
{
public:
    explicit MyceliumGroveEditor (MyceliumGroveProcessor&);
    ~MyceliumGroveEditor() override;

    void paint (juce::Graphics&) override;
    void resized() override;

private:
    juce::var handleSeedSpore (const juce::Array<juce::var>& args,
                               juce::WebBrowserComponent::NativeFunctionCompletion completion);
    juce::var handleBondFormed (const juce::Array<juce::var>& args,
                                juce::WebBrowserComponent::NativeFunctionCompletion completion);

    // Build the options used to construct webView.  Encapsulated so we
    // register all attachments + native fns in one place.
    juce::WebBrowserComponent::Options buildWebOptions();

    MyceliumGroveProcessor& proc;

    // JUCE 8 destruction-order rule (BREAKING_CHANGES.md):
    //   Relays declared first  (destroyed LAST)
    //   WebView declared next  (destroyed MIDDLE)
    //   Attachments declared last (destroyed FIRST)
    // Anything else crashes on close.
    std::vector<std::unique_ptr<juce::WebSliderRelay>>          sliderRelays;
    std::vector<std::unique_ptr<juce::WebToggleButtonRelay>>    toggleRelays;
    std::vector<std::unique_ptr<juce::WebComboBoxRelay>>        choiceRelays;

    juce::WebBrowserComponent webView;

    std::vector<std::unique_ptr<juce::WebSliderParameterAttachment>>     sliderAttachments;
    std::vector<std::unique_ptr<juce::WebToggleButtonParameterAttachment>> toggleAttachments;
    std::vector<std::unique_ptr<juce::WebComboBoxParameterAttachment>>   choiceAttachments;

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (MyceliumGroveEditor)
};
