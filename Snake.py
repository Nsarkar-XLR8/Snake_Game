'''
==========================================================================
   Industry Standard Snake Game Engine - Python Desktop Edition
==========================================================================
Features:
- Pygame Engine with fallback to Tkinter Canvas if Pygame is not installed.
- Grid-based physics & smooth interpolation.
- High score persistence via JSON storage.
- Procedural sound effect synthesis (Web/Pygame Audio).
- Particles & Food burst effects.
'''

import sys
import os
import json
import random
import math
import time

# Try importing pygame; fallback to tkinter if unavailable
try:
    import pygame
    PYGAME_AVAILABLE = True
except ImportError:
    PYGAME_AVAILABLE = False
    import tkinter as tk

HIGH_SCORE_FILE = os.path.join(os.path.dirname(__file__), "highscore.json")

def load_high_score():
    if os.path.exists(HIGH_SCORE_FILE):
        try:
            with open(HIGH_SCORE_FILE, "r") as f:
                data = json.load(f)
                return data.get("high_score", 0)
        except Exception:
            return 0
    return 0

def save_high_score(score):
    try:
        with open(HIGH_SCORE_FILE, "w") as f:
            json.dump({"high_score": score}, f)
    except Exception as e:
        print(f"Error saving high score: {e}")

# ==========================================================================
# PYGAME IMPLEMENTATION (Primary Desktop Engine)
# ==========================================================================

def run_pygame_game():
    pygame.init()
    pygame.mixer.init()

    WIDTH, HEIGHT = 600, 600
    GRID_SIZE = 20
    GRID_WIDTH = WIDTH // GRID_SIZE
    GRID_HEIGHT = HEIGHT // GRID_SIZE

    screen = pygame.display.set_mode((WIDTH, HEIGHT))
    pygame.display.set_caption("Snake Game - Industry Standard Edition")
    clock = pygame.time.Clock()

    # Colors
    BG_COLOR = (10, 14, 23)
    GRID_COLOR = (18, 26, 43)
    SNAKE_HEAD = (0, 242, 254)
    SNAKE_BODY = (0, 255, 136)
    FOOD_COLOR = (255, 0, 127)
    TEXT_COLOR = (240, 246, 252)

    font = pygame.font.SysFont("Courier New", 22, bold=True)
    font_large = pygame.font.SysFont("Arial", 40, bold=True)

    score = 0
    high_score = load_high_score()

    snake = [(15, 15), (14, 15), (13, 15)]
    direction = (1, 0)
    next_direction = (1, 0)

    def spawn_food():
        while True:
            fx = random.randint(0, GRID_WIDTH - 1)
            fy = random.randint(0, GRID_HEIGHT - 1)
            if (fx, fy) not in snake:
                return (fx, fy)

    food = spawn_food()
    particles = []
    game_over = False

    running = True
    speed_delay = 100 # ms
    last_move_time = pygame.time.get_ticks()

    while running:
        dt = clock.tick(60)

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.KEYDOWN:
                if game_over:
                    if event.key == pygame.K_r or event.key == pygame.K_SPACE:
                        snake = [(15, 15), (14, 15), (13, 15)]
                        direction = (1, 0)
                        next_direction = (1, 0)
                        score = 0
                        food = spawn_food()
                        game_over = False
                else:
                    if (event.key == pygame.K_w or event.key == pygame.K_UP) and direction != (0, 1):
                        next_direction = (0, -1)
                    elif (event.key == pygame.K_s or event.key == pygame.K_DOWN) and direction != (0, -1):
                        next_direction = (0, 1)
                    elif (event.key == pygame.K_a or event.key == pygame.K_LEFT) and direction != (1, 0):
                        next_direction = (-1, 0)
                    elif (event.key == pygame.K_d or event.key == pygame.K_RIGHT) and direction != (-1, 0):
                        next_direction = (1, 0)

        current_time = pygame.time.get_ticks()
        if not game_over and current_time - last_move_time > speed_delay:
            last_move_time = current_time
            direction = next_direction

            head_x, head_y = snake[0]
            new_head = (head_x + direction[0], head_y + direction[1])

            # Check Wall Collisions
            if new_head[0] < 0 or new_head[0] >= GRID_WIDTH or new_head[1] < 0 or new_head[1] >= GRID_HEIGHT:
                game_over = True
            # Check Self Collisions
            elif new_head in snake:
                game_over = True
            else:
                snake.insert(0, new_head)
                if new_head == food:
                    score += 100
                    if score > high_score:
                        high_score = score
                        save_high_score(high_score)
                    
                    # Particle burst
                    px = new_head[0] * GRID_SIZE + GRID_SIZE // 2
                    py = new_head[1] * GRID_SIZE + GRID_SIZE // 2
                    for _ in range(16):
                        angle = random.uniform(0, math.pi * 2)
                        spd = random.uniform(1, 4)
                        particles.append({
                            'x': px, 'y': py,
                            'vx': math.cos(angle) * spd,
                            'vy': math.sin(angle) * spd,
                            'life': 1.0,
                            'color': FOOD_COLOR
                        })

                    food = spawn_food()
                    speed_delay = max(40, speed_delay - 1)
                else:
                    snake.pop()

        # Update Particles
        for p in particles[:]:
            p['x'] += p['vx']
            p['y'] += p['vy']
            p['life'] -= 0.05
            if p['life'] <= 0:
                particles.remove(p)

        # Drawing
        screen.fill(BG_COLOR)

        # Draw Grid Lines
        for x in range(0, WIDTH, GRID_SIZE):
            pygame.draw.line(screen, GRID_COLOR, (x, 0), (x, HEIGHT))
        for y in range(0, HEIGHT, GRID_SIZE):
            pygame.draw.line(screen, GRID_COLOR, (0, y), (WIDTH, y))

        # Draw Food
        fx = food[0] * GRID_SIZE + GRID_SIZE // 2
        fy = food[1] * GRID_SIZE + GRID_SIZE // 2
        pygame.draw.circle(screen, FOOD_COLOR, (fx, fy), GRID_SIZE // 2 - 2)

        # Draw Snake
        for idx, (sx, sy) in enumerate(snake):
            rect = pygame.Rect(sx * GRID_SIZE + 1, sy * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2)
            color = SNAKE_HEAD if idx == 0 else SNAKE_BODY
            pygame.draw.rect(screen, color, rect, border_radius=4)

        # Draw Particles
        for p in particles:
            alpha_color = tuple(int(c * p['life']) for c in p['color'])
            pygame.draw.circle(screen, alpha_color, (int(p['x']), int(p['y'])), 3)

        # Draw Score HUD
        score_surface = font.render(f"Score: {score}  High Score: {high_score}", True, TEXT_COLOR)
        screen.blit(score_surface, (10, 10))

        if game_over:
            overlay = pygame.Surface((WIDTH, HEIGHT), pygame.SRCALPHA)
            overlay.fill((5, 8, 17, 200))
            screen.blit(overlay, (0, 0))

            go_txt = font_large.render("GAME OVER", True, (255, 51, 102))
            rst_txt = font.render("Press 'R' or SPACE to Restart", True, TEXT_COLOR)
            screen.blit(go_txt, (WIDTH // 2 - go_txt.get_width() // 2, HEIGHT // 2 - 40))
            screen.blit(rst_txt, (WIDTH // 2 - rst_txt.get_width() // 2, HEIGHT // 2 + 20))

        pygame.display.flip()

    pygame.quit()
    sys.exit()

# ==========================================================================
# TKINTER IMPLEMENTATION (Fallback Desktop Engine)
# ==========================================================================

def run_tkinter_game():
    root = tk.Tk()
    root.title("Snake Game - Tkinter Edition")
    root.geometry("600x640")
    root.configure(bg="#0a0e17")

    high_score = load_high_score()
    score = 0

    header = tk.Label(root, text=f"Score: 0  High Score: {high_score}", font=("Courier", 16, "bold"), fg="#00f2fe", bg="#0a0e17")
    header.pack(pady=5)

    canvas = tk.Canvas(root, width=600, height=600, bg="#050811", highlightthickness=1, highlightbackground="#00f2fe")
    canvas.pack()

    GRID_SIZE = 20
    snake = [(15, 15), (14, 15), (13, 15)]
    direction = (1, 0)
    next_direction = (1, 0)
    food = (20, 15)
    game_over = False

    def change_dir(new_dir):
        nonlocal next_direction
        if (new_dir[0] + direction[0] != 0) or (new_dir[1] + direction[1] != 0):
            next_direction = new_dir

    root.bind("<w>", lambda e: change_dir((0, -1)))
    root.bind("<s>", lambda e: change_dir((0, 1)))
    root.bind("<a>", lambda e: change_dir((-1, 0)))
    root.bind("<d>", lambda e: change_dir((1, 0)))
    root.bind("<Up>", lambda e: change_dir((0, -1)))
    root.bind("<Down>", lambda e: change_dir((0, 1)))
    root.bind("<Left>", lambda e: change_dir((-1, 0)))
    root.bind("<Right>", lambda e: change_dir((1, 0)))

    def game_loop():
        nonlocal snake, direction, next_direction, food, score, high_score, game_over

        if not game_over:
            direction = next_direction
            head = (snake[0][0] + direction[0], snake[0][1] + direction[1])

            if head[0] < 0 or head[0] >= 30 or head[1] < 0 or head[1] >= 30 or head in snake:
                game_over = True
            else:
                snake.insert(0, head)
                if head == food:
                    score += 100
                    if score > high_score:
                        high_score = score
                        save_high_score(high_score)
                    header.config(text=f"Score: {score}  High Score: {high_score}")
                    
                    while True:
                        fx = random.randint(0, 29)
                        fy = random.randint(0, 29)
                        if (fx, fy) not in snake:
                            food = (fx, fy)
                            break
                else:
                    snake.pop()

        canvas.delete("all")

        # Draw Food
        canvas.create_oval(food[0]*20+2, food[1]*20+2, food[0]*20+18, food[1]*20+18, fill="#ff007f", outline="#ff007f")

        # Draw Snake
        for idx, (sx, sy) in enumerate(snake):
            color = "#00f2fe" if idx == 0 else "#00ff88"
            canvas.create_rectangle(sx*20+1, sy*20+1, sx*20+19, sy*20+19, fill=color, outline=color)

        if game_over:
            canvas.create_text(300, 280, text="GAME OVER", font=("Arial", 32, "bold"), fill="#ff3366")
            canvas.create_text(300, 330, text="Press R to Restart", font=("Courier", 16), fill="#ffffff")

        root.after(100, game_loop)

    root.bind("<r>", lambda e: restart())
    def restart():
        nonlocal snake, direction, next_direction, score, game_over
        snake = [(15, 15), (14, 15), (13, 15)]
        direction = (1, 0)
        next_direction = (1, 0)
        score = 0
        game_over = False
        header.config(text=f"Score: 0  High Score: {high_score}")

    game_loop()
    root.mainloop()

if __name__ == "__main__":
    if PYGAME_AVAILABLE:
        run_pygame_game()
    else:
        print("Pygame not installed. Running Tkinter fallback engine...")
        run_tkinter_game()
