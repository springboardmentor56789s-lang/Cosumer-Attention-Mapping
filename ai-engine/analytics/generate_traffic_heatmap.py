import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

def generate_customer_foot_traffic_data(n_shoppers=1200, seed=42):
    """
    Simulates shopper (x, y) coordinates across a store layout (100m x 60m grid)
    using Gaussian clusters representing key store zones:
    - Entrance Gate (x: 10, y: 10)
    - Row 1 Packaged Snacks (x: 30, y: 45)
    - Row 2 Cooking Utensils Dwell Hotspot (x: 50, y: 25)
    - Row 4 Electronics & Audio Focus (x: 80, y: 45)
    - Express Checkout Counter Queue (x: 60, y: 10)
    """
    np.random.seed(seed)
    
    # Store cluster centers (x, y), covariance matrices, and shopper ratios
    clusters = [
        # (center_x, center_y), (cov_x, cov_y), num_shoppers
        ((10, 10), (4, 4), int(n_shoppers * 0.15)),   # Entrance Gate A
        ((30, 45), (12, 25), int(n_shoppers * 0.22)), # Row 1 Snacks
        ((50, 25), (15, 18), int(n_shoppers * 0.28)), # Row 2 Utensils (Dwell Hotspot)
        ((80, 45), (10, 22), int(n_shoppers * 0.20)), # Row 4 Electronics
        ((60, 10), (18, 5),  int(n_shoppers * 0.15)), # Express Checkout
    ]
    
    x_coords = []
    y_coords = []
    
    for (cx, cy), (var_x, var_y), count in clusters:
        x = np.random.normal(cx, np.sqrt(var_x), count)
        y = np.random.normal(cy, np.sqrt(var_y), count)
        x_coords.extend(x)
        y_coords.extend(y)
        
    x_arr = np.clip(np.array(x_coords), 0, 100)
    y_arr = np.clip(np.array(y_coords), 0, 60)
    
    return x_arr, y_arr

def plot_2d_gaussian_traffic_heatmap():
    """
    Generates and renders a professional 2D Gaussian Kernel Density Estimate (KDE)
    heatmap representing retail store customer foot traffic.
    """
    # 1. Generate synthetic spatial coordinate telemetry
    x, y = generate_customer_foot_traffic_data(n_shoppers=1500)
    
    # 2. Configure Matplotlib dark theme background & figure aesthetics
    plt.style.use('dark_background')
    fig, ax = plt.subplots(figsize=(12, 7), dpi=300)
    
    # Set dark background color palette matching dashboard aesthetics (#0B0F19)
    fig.patch.set_facecolor('#0B0F19')
    ax.set_facecolor('#0B0F19')
    
    # 3. Render Continuous 2D Gaussian Kernel Density Estimate (KDE) Overlay
    kde = sns.kdeplot(
        x=x,
        y=y,
        cmap='turbo',          # Turbo color gradient (blue -> cyan -> yellow -> red)
        fill=True,             # Continuous density fill
        bw_adjust=0.8,         # Bandwidth smoothing factor for Gaussian kernel
        thresh=0.02,           # Lower bound cutoff to reveal dark background
        levels=120,            # High density levels for smooth interpolation
        alpha=0.92,
        ax=ax,
        cbar=True,
        cbar_kws={'label': 'Traffic Density Index (0-100)', 'shrink': 0.85}
    )
    
    # 4. Customize Colorbar Label Aesthetics
    cbar = ax.collections[0].colorbar
    cbar.set_label('Traffic Density Index (0 - 100)', color='#E2E8F0', fontsize=11, fontweight='bold', labelpad=12)
    cbar.ax.tick_params(labelsize=9, colors='#94A3B8')
    
    # 5. Overlay Store Architectural Annotations (Aisles & Zones)
    zones = [
        ("Entrance Gate A", 10, 10),
        ("Row 1: Snacks", 30, 45),
        ("Row 2: Cooking Utensils", 50, 25),
        ("Row 4: Electronics", 80, 45),
        ("Checkout Counter 4", 60, 10),
    ]
    
    for label, zx, zy in zones:
        ax.plot(zx, zy, marker='o', markersize=6, color='white', markeredgecolor='#0B0F19', markeredgewidth=1.5)
        ax.text(
            zx, zy + 3, label,
            color='#FFFFFF', fontsize=9, fontweight='bold',
            ha='center', va='bottom',
            bbox=dict(boxstyle='round,pad=0.3', facecolor='#0F172A', edgecolor='#38BDF8', alpha=0.85, linewidth=1)
        )
        
    # 6. Customize Gridlines, Boundaries & Axes
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 60)
    
    ax.set_xlabel('Store Width Coordinate X (meters)', fontsize=11, fontweight='bold', color='#CBD5E1', labelpad=10)
    ax.set_ylabel('Store Depth Coordinate Y (meters)', fontsize=11, fontweight='bold', color='#CBD5E1', labelpad=10)
    
    ax.tick_params(axis='both', which='major', labelsize=9, colors='#94A3B8')
    
    # Clean gridlines
    ax.grid(True, linestyle='--', linewidth=0.5, color='#334155', alpha=0.5)
    
    # Border spines formatting
    for spine in ax.spines.values():
        spine.set_color('#334155')
        spine.set_linewidth(1.2)
        
    # 7. Add Professional Title & Subtitle
    plt.title(
        "RETAIL STORE CUSTOMER FOOT TRAFFIC DENSITY\n2D Gaussian Kernel Density Estimation (KDE) Overlay",
        fontsize=13, fontweight='bold', color='#F8FAFC', pad=15, loc='left'
    )
    
    plt.tight_layout()
    
    # Save output plot image
    output_filename = "retail_foot_traffic_gaussian_heatmap.png"
    plt.savefig(output_filename, dpi=300, facecolor=fig.get_facecolor(), bbox_inches='tight')
    plt.close()
    print(f"Successfully generated 2D Gaussian density heatmap image: {output_filename}")

if __name__ == "__main__":
    plot_2d_gaussian_traffic_heatmap()
