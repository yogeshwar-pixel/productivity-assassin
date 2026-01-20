import { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, RefreshControl, Dimensions, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { LineChart, BarChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import { StatsCalculator } from "../utils/statsCalculator";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function Stats() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);

  const fetchStats = async () => {
    // 1. Try to sync offline data from extension first
    try {
      await StatsCalculator.syncWithExtension();
    } catch (e) {
      console.log('Sync skipped or failed (extension might be inactive)');
    }

    // 2. Load all stats (including newly synced ones)
    const data = await StatsCalculator.getAllStats();
    setStats(data);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStats();
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#00ffcc" />
        <Text style={{ color: '#fff', marginTop: 10 }}>Calculating Productivity...</Text>
      </View>
    );
  }

  // Fallback if no data
  if (!stats) return null;

  const { daily, weekly, distractions, timeSlots } = stats;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00ffcc" />
      }
    >
      <Text style={styles.headerTitle}>📊 Productivity Report</Text>

      {/* 1. DAILY SCORECARD */}
      <View style={styles.scoreCard}>
        <View>
          <Text style={styles.label}>Daily Grade</Text>
          <Text style={[styles.grade, { color: getGradeColor(daily.grade) }]}>{daily.grade}</Text>
        </View>
        <View style={styles.scoreDivider} />
        <View>
          <Text style={styles.label}>Productivity Score</Text>
          <Text style={styles.score}>{daily.productivityScore}/100</Text>
        </View>
        <View style={styles.scoreDivider} />
        <View>
          <Text style={styles.label}>Violations</Text>
          <Text style={styles.violationCount}>{daily.violations}</Text>
          <Text style={{ color: daily.violationChange > 0 ? '#ff3333' : '#00ff99', fontSize: 10 }}>
            {daily.violationChange > 0 ? `+${daily.violationChange}` : daily.violationChange} from yest.
          </Text>
        </View>
      </View>

      {/* 2. WEEKLY TREND CHART */}
      <Text style={styles.sectionTitle}>Weekly Activity Trend</Text>
      <View style={styles.chartContainer}>
        <Text style={styles.chartLabel}>Focus Minutes (Green) vs Violations (Red)</Text>
        <LineChart
          data={{
            labels: weekly.labels,
            datasets: [
              {
                data: weekly.focusData.map(m => m / 60), // Convert to Hours for scale if needed, or keep minutes
                color: (opacity = 1) => `rgba(0, 255, 153, ${opacity})`, // Green
                strokeWidth: 2
              },
              {
                data: weekly.violationData,
                color: (opacity = 1) => `rgba(255, 51, 51, ${opacity})`, // Red
                strokeWidth: 2
              }
            ],
            legend: ["Focus (Min)", "Violations"]
          }}
          width={SCREEN_WIDTH - 40}
          height={220}
          chartConfig={{
            backgroundColor: "#1a1a1a",
            backgroundGradientFrom: "#1a1a1a",
            backgroundGradientTo: "#1a1a1a",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(170, 170, 170, ${opacity})`,
            propsForDots: {
              r: "4",
              strokeWidth: "2",
              stroke: "#ffa726"
            }
          }}
          bezier
          style={{ borderRadius: 16, marginVertical: 8 }}
        />
      </View>

      {/* 3. TOP DISTRACTIONS */}
      <Text style={styles.sectionTitle}>Top Distractions</Text>
      <View style={styles.listContainer}>
        {distractions.length === 0 ? (
          <Text style={styles.emptyText}>No distractions recorded yet. Keep it up!</Text>
        ) : (
          distractions.map((item, index) => (
            <View key={index} style={styles.listItem}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.rank}>#{index + 1}</Text>
                <Text style={styles.siteName}>{item.name}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.count}>{item.count} times</Text>
                <Text style={styles.percentage}>{item.percentage}% of total</Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* 4. WEAKEST TIME ANALYSIS */}
      <Text style={styles.sectionTitle}>Weakest Time of Day</Text>
      <View style={styles.timeContainer}>
        <View style={styles.timeIconContainer}>
          <Ionicons name={getTimeIcon(timeSlots.weakestSlot)} size={40} color="#ff3333" />
        </View>
        <View style={{ flex: 1, paddingLeft: 15 }}>
          <Text style={styles.weakTimeTitle}>
            {timeSlots.weakestSlot.toUpperCase()} ({timeSlots.slots[timeSlots.weakestSlot]} violations)
          </Text>
          <Text style={styles.weakTimeDesc}>
            You tend to get distracted most during the {timeSlots.weakestSlot}.
            Try scheduling your deepest work outside this window.
          </Text>
        </View>
      </View>

    </ScrollView>
  );
}

// Helpers
function getGradeColor(grade) {
  if (grade === 'A+' || grade === 'A') return '#00ff99';
  if (grade === 'B') return '#00ccff';
  if (grade === 'C') return '#ffcc00';
  return '#ff3333';
}

function getTimeIcon(slot) {
  switch (slot) {
    case 'morning': return 'sunny-outline';
    case 'afternoon': return 'partly-sunny-outline';
    case 'evening': return 'moon-outline';
    case 'night': return 'bed-outline';
    default: return 'time-outline';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#000'
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    marginTop: 10
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ccc',
    marginTop: 25,
    marginBottom: 15
  },
  scoreCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333'
  },
  scoreDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#444'
  },
  label: {
    color: '#aaa',
    fontSize: 12,
    marginBottom: 5,
    textAlign: 'center'
  },
  grade: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  score: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  violationCount: {
    fontSize: 24,
    color: '#ff3333',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  chartContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 10,
    alignItems: 'center'
  },
  chartLabel: {
    color: '#666',
    fontSize: 12,
    marginBottom: 5,
    alignSelf: 'flex-start',
    marginLeft: 10
  },
  listContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    overflow: 'hidden'
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333'
  },
  rank: {
    color: '#666',
    fontWeight: 'bold',
    marginRight: 10,
    fontSize: 16
  },
  siteName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    textTransform: 'capitalize'
  },
  count: {
    color: '#ff3333',
    fontWeight: 'bold',
    fontSize: 14
  },
  percentage: {
    color: '#666',
    fontSize: 12
  },
  emptyText: {
    color: '#666',
    padding: 20,
    textAlign: 'center',
    fontStyle: 'italic'
  },
  timeContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#ff3333'
  },
  weakTimeTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5
  },
  weakTimeDesc: {
    color: '#aaa',
    fontSize: 14,
    lineHeight: 20
  }
});
