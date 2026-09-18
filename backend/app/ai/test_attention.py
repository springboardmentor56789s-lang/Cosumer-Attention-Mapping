from attention_analyzer import AttentionAnalyzer

analyzer = AttentionAnalyzer()

result = analyzer.calculate_attention(
    total_frames=260,
    total_persons=20
)

print(result)