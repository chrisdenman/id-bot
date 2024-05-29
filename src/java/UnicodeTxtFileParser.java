import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.stream.Collectors;


class UnicodeTxtFileParser implements Runnable {

    enum UnicodeCharacterProperty {
        // "...for characters that are emoji"
        EMOJI("Emoji"),
        // "...for characters that have emoji presentation by default"
        EMOJI_PRESENTATION("Emoji_Presentation"),
        // "...for characters that are emoji modifiers"
        EMOJI_MODIFIER("Emoji_Modifier"),
        // "...for characters that can serve as a base for emoji modifiers"
        EMOJI_MODIFIER_BASE("Emoji_Modifier_Base"),
        // "...for characters used in emoji sequences that normally do not appear on emoji keyboards as separate
        // choices, such as keycap base characters or Regional_Indicator characters. All characters in emoji sequences
        // are either Emoji or Emoji_Component. Implementations must not, however, assume that all Emoji_Component
        // characters are also Emoji. There are some non-emoji characters that are used in various emoji sequences, such
        // as tag characters and ZWJ."
        EMOJI_COMPONENT("Emoji_Component"), //
        // "...for characters that are used to future-proof segmentation. The Extended_Pictographic characters contain
        // all the Emoji characters except for some Emoji_Component characters."
        EXTENDED_PICTOGRAPHIC("Extended_Pictographic");

        private final String textFileValue;

        private static final Map<String, UnicodeCharacterProperty> vToK =
                Arrays
                        .stream(UnicodeCharacterProperty.values())
                        .collect(Collectors.toMap(it -> it.textFileValue, it -> it));

        public static UnicodeCharacterProperty valueOfTextFile(final String textFileValue) {
            return vToK.get(textFileValue);
        }

        UnicodeCharacterProperty(final String textPresentation) {
            this.textFileValue = textPresentation;
        }
    }

    static class CodePoint implements Comparable<CodePoint> {

        public int compareTo(CodePoint other) {
            return this.codePoint - other.codePoint;
        }

        private final int codePoint;
        private final Set<UnicodeCharacterProperty> properties =
                HashSet.newHashSet(UnicodeCharacterProperty.values().length / 2);
        private final Set<String> comments = new HashSet<>();

        public CodePoint(final int codePoint) {
            this.codePoint = codePoint;
        }

        public CodePoint(
                final int codePoint,
                final UnicodeCharacterProperty ucCharacterProperty,
                final String comment
        ) {
            this(codePoint);
            add(ucCharacterProperty, comment);
        }

        public void add(final Set<UnicodeCharacterProperty> ucCharacterProperty, final Set<String> comment) {
            this.properties.addAll(ucCharacterProperty);
            this.comments.addAll(comment);
        }

        public void add(final UnicodeCharacterProperty ucCharacterProperty, final String comment) {
            this.properties.add(ucCharacterProperty);
            this.comments.add(comment);
        }

        @Override
        public String toString() {
            return "\"\\u{" + String.format("%04X", codePoint) + "}\"";
        }

        public int getCodePoint() {
            return codePoint;
        }

        public Set<UnicodeCharacterProperty> getProperties() {
            return properties;
        }

        public Set<String> getComments() {
            return comments;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            CodePoint codePoint1 = (CodePoint) o;
            return codePoint == codePoint1.codePoint;
        }

        @Override
        public int hashCode() {
            return Objects.hashCode(codePoint);
        }
    }

    private Set<CodePoint> fromEmojiDataTxtFileFormat(final String recordText) {
        final Set<CodePoint> codePoints = new HashSet<>();

        final String[] codePointsAndRest = recordText.split(";");
        final String codePointOrRange = codePointsAndRest[0].trim();

        final String property = codePointsAndRest[1].substring(0, codePointsAndRest[1].indexOf('#')).trim();
        final String comments = codePointsAndRest[1].substring(1 + codePointsAndRest[1].indexOf('#')).trim();

        final UnicodeCharacterProperty unicodeCharacterProperty = UnicodeCharacterProperty.valueOfTextFile(property);
        final var rangeComponents = codePointOrRange.split("\\.\\.");
        final var codePointFirst = Integer.parseInt((rangeComponents[0]), 16);
        if (rangeComponents.length == 1) {
            codePoints.add(new CodePoint(codePointFirst, unicodeCharacterProperty, comments));
        } else {
            for (var i = codePointFirst; i <= Integer.parseInt(rangeComponents[1], 16); i++) {
                codePoints.add(new CodePoint(i, unicodeCharacterProperty, comments));
            }
        }

        return codePoints;
    }


    @Override
    public void run() {

        final Map<Integer, CodePoint> codePointToInstance = new HashMap<>();

        try (final var lines =
                     Files.lines(Path.of(new File(".").getCanonicalPath() + "/res/txt/ucd/UCD/emoji/emoji-data.txt"))) {
            lines
                    .filter(it -> !it.trim().isEmpty() && !it.trim().startsWith("#")).forEach(line -> {
                        final Set<CodePoint> singletonOrRangeCodePoints = fromEmojiDataTxtFileFormat(line);
                        for (final CodePoint codePoint : singletonOrRangeCodePoints) {
                            if (codePointToInstance.containsKey(codePoint.codePoint)) {
                                codePointToInstance.get(
                                        codePoint.getCodePoint()).add(codePoint.getProperties(), codePoint.getComments()
                                );
                            } else {
                                codePointToInstance.put(codePoint.getCodePoint(), codePoint);
                            }
                        }
                    });
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        var sortable = codePointToInstance.values().stream().filter(it -> it.getProperties().contains(UnicodeCharacterProperty.EMOJI)).sorted().toList();

        System.out.println(sortable);

//        var startIndex = 0;
//        while (startIndex < sortable.size() ) {
//            var windowHeight = 0;
//            var startPoint = sortable.get(startIndex);
//
//            while (
//                    (startIndex + windowHeight < sortable.size()) &&
//                            sortable.get(startIndex + windowHeight).codePoint == startPoint.codePoint + windowHeight
//            ) { windowHeight++; }
//
//            if (windowHeight == 1) {
//                System.out.println("\"" + startPoint + "\",");
//            } else {
//                System.out.println("[\"" + startPoint + "\", \"" + sortable.get(startIndex + windowHeight - 1) + "\"],");
//            }
//            startIndex += windowHeight;
//        }
    }

    public static void main(String[] args) throws IOException {
        new UnicodeTxtFileParser().run();
    }
}
